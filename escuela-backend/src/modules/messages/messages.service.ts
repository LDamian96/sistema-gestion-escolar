import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateConversationDto,
  CreateMessageDto,
  QueryConversationsDto,
  QueryMessagesDto,
} from './dto';
import { Prisma, ParticipantRole } from '@prisma/client';
import { NotificationEventsService } from '../notifications/notification-events.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
  ) {}

  async createConversation(dto: CreateConversationDto, creatorId: string, creatorName: string, creatorRole: ParticipantRole) {
    const conversation = await this.prisma.conversation.create({
      data: {
        studentId: dto.studentId,
        studentName: dto.studentName,
        gradeSection: dto.gradeSection,
        createdBy: creatorId,
        participants: {
          create: dto.participants.map((p) => ({
            role: p.role,
            teacherId: p.teacherId,
            parentId: p.parentId,
          })),
        },
      },
      include: {
        participants: {
          include: {
            teacher: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
            parent: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    if (dto.initialMessage) {
      await this.sendMessage(
        {
          conversationId: conversation.id,
          content: dto.initialMessage,
          senderName: creatorName,
          senderRole: creatorRole,
        },
        creatorId,
      );
    }

    return conversation;
  }

  async getConversations(userId: string, userRole: string, query: QueryConversationsDto) {
    const { unreadOnly, page = 1, limit = 20 } = query;

    let teacherId: string | undefined;
    let parentId: string | undefined;

    if (userRole === 'TEACHER') {
      const teacher = await this.prisma.teacher.findFirst({ where: { userId } });
      teacherId = teacher?.id;
    } else if (userRole === 'PARENT') {
      const parent = await this.prisma.parent.findFirst({ where: { userId } });
      parentId = parent?.id;
    }

    const where: Prisma.ConversationWhereInput = {
      participants: {
        some: {
          OR: [
            ...(teacherId ? [{ teacherId }] : []),
            ...(parentId ? [{ parentId }] : []),
          ],
        },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        include: {
          participants: {
            include: {
              teacher: {
                include: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
              parent: {
                include: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      data: data.map((c) => ({
        ...c,
        lastMessagePreview: c.messages[0] || null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getConversation(id: string, userId: string, userRole: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            teacher: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
              },
            },
            parent: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversacion no encontrada');
    }

    return conversation;
  }

  async getMessages(conversationId: string, userId: string, userRole: string, query: QueryMessagesDto) {
    await this.getConversation(conversationId, userId, userRole);

    const { page = 1, limit = 50 } = query;

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        include: {
          attachments: true,
          readBy: {
            select: { userId: true, readAt: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    await this.markAsRead(conversationId, userId);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async sendMessage(dto: CreateMessageDto, senderId: string) {
    // Obtener la conversación con participantes y schoolId
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: dto.conversationId },
      include: {
        participants: {
          include: {
            teacher: {
              include: {
                user: { select: { id: true } },
                school: { select: { id: true } },
              },
            },
            parent: {
              include: {
                user: { select: { id: true } },
              },
            },
          },
        },
      },
    });

    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        conversationId: dto.conversationId,
        senderId,
        senderName: dto.senderName,
        senderRole: dto.senderRole,
        attachments: dto.attachments
          ? {
              create: dto.attachments.map((a) => ({
                name: a.name,
                type: a.type,
                url: a.url,
                size: a.size,
              })),
            }
          : undefined,
      },
      include: {
        attachments: true,
      },
    });

    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: {
        lastMessage: dto.content.substring(0, 100),
        lastMessageAt: new Date(),
        lastMessageSenderId: senderId,
      },
    });

    // Enviar notificación de nuevo mensaje
    if (conversation) {
      // Obtener schoolId del primer profesor en la conversación
      const teacherParticipant = conversation.participants.find(p => p.teacher);
      const schoolId = teacherParticipant?.teacher?.school?.id;

      if (schoolId) {
        await this.notificationEvents.onNewMessage(
          {
            id: message.id,
            content: dto.content,
            senderName: dto.senderName,
            conversation: {
              id: conversation.id,
              studentName: conversation.studentName || 'Estudiante',
              participants: conversation.participants.map(p => ({
                teacherId: p.teacherId || undefined,
                parentId: p.parentId || undefined,
              })),
            },
          },
          senderId,
          schoolId,
        );
      }
    }

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    const unreadMessages = await this.prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readBy: {
          none: { userId },
        },
      },
      select: { id: true },
    });

    if (unreadMessages.length > 0) {
      await this.prisma.messageRead.createMany({
        data: unreadMessages.map((m) => ({
          messageId: m.id,
          userId,
        })),
        skipDuplicates: true,
      });
    }

    return { markedAsRead: unreadMessages.length };
  }

  async getUnreadCount(userId: string, userRole: string) {
    let teacherId: string | undefined;
    let parentId: string | undefined;

    if (userRole === 'TEACHER') {
      const teacher = await this.prisma.teacher.findFirst({ where: { userId } });
      teacherId = teacher?.id;
    } else if (userRole === 'PARENT') {
      const parent = await this.prisma.parent.findFirst({ where: { userId } });
      parentId = parent?.id;
    }

    const count = await this.prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: {
              OR: [
                ...(teacherId ? [{ teacherId }] : []),
                ...(parentId ? [{ parentId }] : []),
              ],
            },
          },
        },
        senderId: { not: userId },
        readBy: {
          none: { userId },
        },
      },
    });

    return { unreadCount: count };
  }

  async deleteConversation(id: string, userId: string, userRole: string) {
    await this.getConversation(id, userId, userRole);
    await this.prisma.conversation.delete({ where: { id } });
    return { message: 'Conversacion eliminada' };
  }
}
