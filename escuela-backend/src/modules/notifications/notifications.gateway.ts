import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UseFilters, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../../common/guards/ws-auth.guard';
import { WsExceptionFilter } from '../../common/filters/ws-exception.filter';
import { NotificationsService } from './notifications.service';
import { RedisService } from '../../database/redis.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { NotificationType, Role } from '@prisma/client';

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
})
@UseFilters(WsExceptionFilter)
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private notificationsService: NotificationsService,
    private redisService: RedisService,
  ) {}

  afterInit() {
    this.logger.log('Notifications WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.validateAndGetUser(client);

      if (!user) {
        this.logger.warn(
          `Notification connection rejected - no valid token: ${client.id}`,
        );
        client.disconnect();
        return;
      }

      // Guardar usuario en socket data
      client.data.user = user;

      // Unir a sala personal para notificaciones
      client.join(`user:${user.sub}`);

      // Unir a sala de rol
      client.join(`role:${user.role}`);

      // Unir a sala de escuela
      if (user.schoolId) {
        client.join(`school:${user.schoolId}`);
      }

      // Guardar en Redis para tracking
      await this.redisService.hSet(
        'notification_sockets',
        user.sub,
        JSON.stringify({
          socketId: client.id,
          role: user.role,
          schoolId: user.schoolId,
          connectedAt: new Date().toISOString(),
        }),
      );

      this.logger.log(
        `User ${user.sub} connected to notifications - Socket: ${client.id}`,
      );

      // Enviar conteo de no leídas al conectarse
      const unreadCount = await this.notificationsService.getUnreadCount(
        user.sub,
      );
      client.emit('notification:unread-count', unreadCount);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Notification connection error: ${message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user as JwtPayload;

    if (user) {
      await this.redisService.hDel('notification_sockets', user.sub);
      this.logger.log(`User ${user.sub} disconnected from notifications`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('notification:mark-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    const user = client.data.user as JwtPayload;

    await this.notificationsService.markAsRead(data.notificationId, user.sub);

    // Enviar nuevo conteo
    const unreadCount = await this.notificationsService.getUnreadCount(
      user.sub,
    );
    client.emit('notification:unread-count', unreadCount);

    return { success: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('notification:mark-all-read')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    const user = client.data.user as JwtPayload;

    const result = await this.notificationsService.markAllAsRead(user.sub);

    client.emit('notification:unread-count', { unreadCount: 0 });

    return { success: true, ...result };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('notification:get-unread')
  async handleGetUnread(@ConnectedSocket() client: Socket) {
    const user = client.data.user as JwtPayload;

    const notifications = await this.notificationsService.findAllForUser(
      user.sub,
      true,
    );

    return { success: true, notifications };
  }

  // ============================================
  // MÉTODOS PÚBLICOS PARA ENVIAR NOTIFICACIONES
  // ============================================

  /**
   * Enviar notificación a un usuario específico
   */
  async sendToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
    this.logger.log(`Notification sent to user ${userId}`);
  }

  /**
   * Enviar notificación a múltiples usuarios
   */
  async sendToUsers(userIds: string[], notification: any) {
    for (const userId of userIds) {
      this.server.to(`user:${userId}`).emit('notification:new', notification);
    }
    this.logger.log(`Notification sent to ${userIds.length} users`);
  }

  /**
   * Enviar notificación a todos los usuarios con un rol específico
   */
  async sendToRole(role: Role, notification: any, schoolId?: string) {
    if (schoolId) {
      // Filtrar por escuela y rol
      const roomName = `school:${schoolId}`;
      // Emitir a la sala de la escuela con filtro de rol
      this.server.to(roomName).emit('notification:new', {
        ...notification,
        targetRole: role,
      });
    } else {
      this.server.to(`role:${role}`).emit('notification:new', notification);
    }
    this.logger.log(`Notification sent to role ${role}`);
  }

  /**
   * Enviar notificación a toda una escuela
   */
  async sendToSchool(schoolId: string, notification: any) {
    this.server.to(`school:${schoolId}`).emit('notification:new', notification);
    this.logger.log(`Notification sent to school ${schoolId}`);
  }

  /**
   * Enviar notificación broadcast a todos los conectados
   */
  async broadcast(notification: any) {
    this.server.emit('notification:new', notification);
    this.logger.log('Broadcast notification sent');
  }

  /**
   * Actualizar conteo de no leídas para un usuario
   */
  async updateUnreadCount(userId: string) {
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    this.server.to(`user:${userId}`).emit('notification:unread-count', unreadCount);
  }

  /**
   * Verificar si un usuario está conectado a notificaciones
   */
  async isUserConnected(userId: string): Promise<boolean> {
    const userData = await this.redisService.hGet(
      'notification_sockets',
      userId,
    );
    return !!userData;
  }

  /**
   * Obtener lista de usuarios conectados
   */
  async getConnectedUsers(): Promise<string[]> {
    const users = await this.redisService.hGetAll('notification_sockets');
    return Object.keys(users);
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  private async validateAndGetUser(client: Socket): Promise<JwtPayload | null> {
    const token = this.extractToken(client);
    if (!token) return null;

    try {
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(
        Buffer.from(base64Payload, 'base64').toString(),
      );
      return payload as JwtPayload;
    } catch {
      return null;
    }
  }

  private extractToken(client: Socket): string | null {
    // 1. Cookies
    const cookies = client.handshake.headers.cookie;
    if (cookies) {
      const accessTokenCookie = cookies
        .split(';')
        .find((c) => c.trim().startsWith('accessToken='));
      if (accessTokenCookie) {
        return accessTokenCookie.split('=')[1];
      }
    }

    // 2. Query param
    const authQuery = client.handshake.query.token;
    if (authQuery && typeof authQuery === 'string') {
      return authQuery;
    }

    // 3. Authorization header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // 4. Handshake auth
    const authHandshake = client.handshake.auth?.token;
    if (authHandshake) {
      return authHandshake;
    }

    return null;
  }
}
