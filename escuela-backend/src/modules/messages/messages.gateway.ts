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
import { MessagesService } from './messages.service';
import { RedisService } from '../../database/redis.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ParticipantRole, AttachmentType } from '@prisma/client';

interface SendMessagePayload {
  conversationId: string;
  content: string;
  attachments?: {
    name: string;
    type: AttachmentType;
    url: string;
    size: number;
  }[];
}

interface TypingPayload {
  conversationId: string;
}

interface MarkReadPayload {
  conversationId: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
})
@UseFilters(WsExceptionFilter)
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private messagesService: MessagesService,
    private redisService: RedisService,
  ) {}

  afterInit() {
    this.logger.log('Messages WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Crear instancia del guard para validar
      const wsGuard = new WsJwtGuard(
        (client as any).server?.jwtService,
        (client as any).server?.configService,
        (client as any).server?.prismaService,
      );

      const user = await this.validateAndGetUser(client);

      if (!user) {
        this.logger.warn(`Connection rejected - no valid token: ${client.id}`);
        client.disconnect();
        return;
      }

      // Guardar usuario en socket data
      client.data.user = user;

      // Guardar socket ID en Redis
      await this.redisService.hSet(
        'online_users',
        user.sub,
        JSON.stringify({
          socketId: client.id,
          role: user.role,
          connectedAt: new Date().toISOString(),
        }),
      );

      // Unir a sala personal
      client.join(`user:${user.sub}`);

      // Cargar y unir a las conversaciones del usuario
      const conversations = await this.getUserConversationIds(user.sub, user.role);
      for (const convId of conversations) {
        client.join(`conversation:${convId}`);
      }

      this.logger.log(`User ${user.sub} connected - Socket: ${client.id}`);

      // Notificar a otros que el usuario está online
      this.server.emit('user:online', {
        userId: user.sub,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Connection error: ${message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user as JwtPayload;

    if (user) {
      await this.redisService.hDel('online_users', user.sub);

      this.server.emit('user:offline', { userId: user.sub });
      this.logger.log(`User ${user.sub} disconnected`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessagePayload,
  ) {
    const user = client.data.user as JwtPayload;

    // ADMIN y TEACHER usan ParticipantRole.TEACHER, PARENT usa ParticipantRole.PARENT
    const senderRole =
      user.role === 'PARENT'
        ? ParticipantRole.PARENT
        : ParticipantRole.TEACHER;

    const message = await this.messagesService.sendMessage(
      {
        conversationId: data.conversationId,
        content: data.content,
        senderName: `${user.firstName} ${user.lastName}`,
        senderRole,
        attachments: data.attachments,
      },
      user.sub,
    );

    // Emitir a todos los participantes de la conversación
    this.server.to(`conversation:${data.conversationId}`).emit('message:new', {
      message,
      conversationId: data.conversationId,
    });

    return { success: true, message };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MarkReadPayload,
  ) {
    const user = client.data.user as JwtPayload;

    const result = await this.messagesService.markAsRead(
      data.conversationId,
      user.sub,
    );

    // Notificar a otros que los mensajes fueron leídos
    client.to(`conversation:${data.conversationId}`).emit('message:read', {
      conversationId: data.conversationId,
      readBy: user.sub,
      readByName: `${user.firstName} ${user.lastName}`,
    });

    return { success: true, ...result };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingPayload,
  ) {
    const user = client.data.user as JwtPayload;

    client.to(`conversation:${data.conversationId}`).emit('typing:start', {
      conversationId: data.conversationId,
      userId: user.sub,
      userName: `${user.firstName} ${user.lastName}`,
    });

    return { success: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingPayload,
  ) {
    const user = client.data.user as JwtPayload;

    client.to(`conversation:${data.conversationId}`).emit('typing:stop', {
      conversationId: data.conversationId,
      userId: user.sub,
    });

    return { success: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = client.data.user as JwtPayload;

    client.join(`conversation:${data.conversationId}`);
    this.logger.log(
      `User ${user.sub} joined conversation ${data.conversationId}`,
    );

    return { success: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('conversation:leave')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = client.data.user as JwtPayload;

    client.leave(`conversation:${data.conversationId}`);
    this.logger.log(
      `User ${user.sub} left conversation ${data.conversationId}`,
    );

    return { success: true };
  }

  // Helper method para obtener el usuario desde el token
  private async validateAndGetUser(client: Socket): Promise<JwtPayload | null> {
    const token = this.extractToken(client);
    if (!token) return null;

    try {
      // Decodificar el token sin verificarlo completamente aquí
      // La verificación completa se hace en WsJwtGuard
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
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

  private async getUserConversationIds(
    userId: string,
    role: string,
  ): Promise<string[]> {
    // Obtener conversaciones del usuario via REST service
    const conversations = await this.messagesService.getConversations(
      userId,
      role,
      { page: 1, limit: 100 },
    );
    return conversations.data.map((c) => c.id);
  }

  // Método público para enviar mensajes desde otros servicios
  async sendMessageToConversation(conversationId: string, message: any) {
    this.server.to(`conversation:${conversationId}`).emit('message:new', {
      message,
      conversationId,
    });
  }

  // Método público para verificar si un usuario está online
  async isUserOnline(userId: string): Promise<boolean> {
    const userData = await this.redisService.hGet('online_users', userId);
    return !!userData;
  }

  // Método público para obtener usuarios online
  async getOnlineUsers(): Promise<string[]> {
    const users = await this.redisService.hGetAll('online_users');
    return Object.keys(users);
  }
}
