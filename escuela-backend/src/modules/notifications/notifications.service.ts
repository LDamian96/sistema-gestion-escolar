import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto, SendBulkNotificationDto } from './dto';
import { NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        type: dto.type || NotificationType.INFO,
        link: dto.link,
        metadata: dto.metadata as Prisma.InputJsonValue,
        userId: dto.userId,
        schoolId: dto.schoolId,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async sendBulk(dto: SendBulkNotificationDto) {
    let userIds: string[] = [];

    if (dto.userIds && dto.userIds.length > 0) {
      // Enviar a usuarios específicos
      userIds = dto.userIds;
    } else if (dto.roles && dto.roles.length > 0) {
      // Enviar a usuarios por rol
      const users = await this.prisma.user.findMany({
        where: {
          schoolId: dto.schoolId,
          role: { in: dto.roles },
          deletedAt: null,
        },
        select: { id: true },
      });
      userIds = users.map(u => u.id);
    } else {
      // Enviar a todos los usuarios de la escuela
      const users = await this.prisma.user.findMany({
        where: {
          schoolId: dto.schoolId,
          deletedAt: null,
        },
        select: { id: true },
      });
      userIds = users.map(u => u.id);
    }

    // Crear notificaciones en batch
    const notifications = await this.prisma.notification.createMany({
      data: userIds.map(userId => ({
        title: dto.title,
        message: dto.message,
        type: dto.type || NotificationType.INFO,
        link: dto.link,
        metadata: dto.metadata as Prisma.InputJsonValue,
        userId,
        schoolId: dto.schoolId,
      })),
    });

    return {
      message: `Se enviaron ${notifications.count} notificaciones`,
      count: notifications.count,
    };
  }

  async findAllForUser(userId: string, unreadOnly?: boolean) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(schoolId?: string, type?: NotificationType) {
    return this.prisma.notification.findMany({
      where: {
        ...(schoolId && { schoolId }),
        ...(type && { type }),
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }
    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: `Se marcaron ${result.count} notificaciones como leídas`,
      count: result.count,
    };
  }

  async remove(id: string) {
    const notification = await this.findOne(id);
    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Notificación eliminada exitosamente' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
    return { unreadCount: count };
  }

  async deleteOldNotifications(daysOld: number = 30) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: dateThreshold },
      },
    });

    return {
      message: `Se eliminaron ${result.count} notificaciones antiguas`,
      count: result.count,
    };
  }
}
