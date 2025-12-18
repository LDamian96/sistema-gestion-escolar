import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { NotificationEventsService } from './notification-events.service';
import { PaymentStatus, SubmissionStatus } from '@prisma/client';

@Injectable()
export class NotificationSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
  ) {}

  onModuleInit() {
    this.logger.log('Notification Scheduler initialized');
  }

  // ============================================
  // RECORDATORIOS DE PAGO - Ejecutar todos los días a las 8am
  // ============================================

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkPaymentReminders() {
    this.logger.log('Running payment reminders check...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Pagos que vencen en 7 días
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    // Pagos que vencen en 3 días
    const in3Days = new Date(today);
    in3Days.setDate(in3Days.getDate() + 3);

    // Pagos que vencen hoy
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      // Recordatorio 7 días
      const payments7Days = await this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.PENDING,
          dueDate: {
            gte: in7Days,
            lt: new Date(in7Days.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          concept: true,
        },
      });

      for (const payment of payments7Days) {
        await this.notificationEvents.onPaymentReminder({
          id: payment.id,
          amount: payment.amount,
          dueDate: payment.dueDate,
          daysUntilDue: 7,
          concept: payment.concept,
          student: {
            id: payment.studentId,
            user: payment.student.user,
          },
        }, payment.schoolId);
      }

      // Recordatorio 3 días
      const payments3Days = await this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.PENDING,
          dueDate: {
            gte: in3Days,
            lt: new Date(in3Days.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          concept: true,
        },
      });

      for (const payment of payments3Days) {
        await this.notificationEvents.onPaymentReminder({
          id: payment.id,
          amount: payment.amount,
          dueDate: payment.dueDate,
          daysUntilDue: 3,
          concept: payment.concept,
          student: {
            id: payment.studentId,
            user: payment.student.user,
          },
        }, payment.schoolId);
      }

      // Recordatorio día de vencimiento
      const paymentsToday = await this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.PENDING,
          dueDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          concept: true,
        },
      });

      for (const payment of paymentsToday) {
        await this.notificationEvents.onPaymentReminder({
          id: payment.id,
          amount: payment.amount,
          dueDate: payment.dueDate,
          daysUntilDue: 0,
          concept: payment.concept,
          student: {
            id: payment.studentId,
            user: payment.student.user,
          },
        }, payment.schoolId);
      }

      // Pagos vencidos (notificar cada día)
      const overduePayments = await this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.PENDING,
          dueDate: { lt: today },
        },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          concept: true,
        },
      });

      for (const payment of overduePayments) {
        const daysOverdue = Math.floor((today.getTime() - payment.dueDate.getTime()) / (24 * 60 * 60 * 1000));

        // Solo notificar cada 7 días después de vencido para no saturar
        if (daysOverdue === 1 || daysOverdue % 7 === 0) {
          await this.notificationEvents.onPaymentReminder({
            id: payment.id,
            amount: payment.amount,
            dueDate: payment.dueDate,
            daysUntilDue: -daysOverdue,
            concept: payment.concept,
            student: {
              id: payment.studentId,
              user: payment.student.user,
            },
          }, payment.schoolId);

          // Marcar como OVERDUE si no lo está
          if (payment.status !== PaymentStatus.OVERDUE) {
            await this.prisma.payment.update({
              where: { id: payment.id },
              data: { status: PaymentStatus.OVERDUE },
            });
          }
        }
      }

      this.logger.log(`Payment reminders sent: 7d=${payments7Days.length}, 3d=${payments3Days.length}, today=${paymentsToday.length}, overdue=${overduePayments.length}`);
    } catch (error) {
      this.logger.error('Error in payment reminders:', error);
    }
  }

  // ============================================
  // TAREAS VENCIDAS - Ejecutar todos los días a las 9am
  // ============================================

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverdueTasks() {
    this.logger.log('Running overdue tasks check...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Buscar tareas que vencieron ayer
      const overdueTasks = await this.prisma.task.findMany({
        where: {
          isPublished: true,
          dueDate: {
            gte: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000),
            lt: today,
          },
        },
        include: {
          course: {
            include: {
              gradeSection: { select: { schoolId: true } },
              enrollments: {
                where: { isActive: true },
                include: {
                  student: {
                    include: {
                      user: { select: { id: true, firstName: true, lastName: true } },
                    },
                  },
                },
              },
            },
          },
          submissions: {
            select: { studentId: true },
          },
        },
      });

      for (const task of overdueTasks) {
        const submittedStudentIds = new Set(task.submissions.map(s => s.studentId));

        const studentsWithoutSubmission = task.course.enrollments
          .filter(e => !submittedStudentIds.has(e.studentId))
          .map(e => ({
            id: e.student.id,
            userId: e.student.user.id,
            user: e.student.user,
          }));

        if (studentsWithoutSubmission.length > 0) {
          await this.notificationEvents.onTaskDueDatePassed(
            {
              id: task.id,
              title: task.title,
              course: { id: task.course.id, name: task.course.name },
            },
            studentsWithoutSubmission,
            task.course.gradeSection.schoolId,
          );
        }
      }

      this.logger.log(`Checked ${overdueTasks.length} overdue tasks`);
    } catch (error) {
      this.logger.error('Error checking overdue tasks:', error);
    }
  }

  // ============================================
  // LIMPIEZA DE NOTIFICACIONES ANTIGUAS - Ejecutar cada domingo a las 3am
  // ============================================

  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldNotifications() {
    this.logger.log('Running old notifications cleanup...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const result = await this.prisma.notification.deleteMany({
        where: {
          isRead: true,
          createdAt: { lt: thirtyDaysAgo },
        },
      });

      this.logger.log(`Deleted ${result.count} old notifications`);
    } catch (error) {
      this.logger.error('Error cleaning up notifications:', error);
    }
  }
}
