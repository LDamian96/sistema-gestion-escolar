import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType, Role, AttendanceStatus } from '@prisma/client';

interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationEventsService {
  private readonly logger = new Logger(NotificationEventsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // ============================================
  // HELPER: Crear notificación y enviar por WebSocket
  // ============================================

  private async createAndSend(
    userId: string,
    schoolId: string,
    data: NotificationData,
  ) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          link: data.link,
          metadata: data.metadata,
          userId,
          schoolId,
        },
      });

      // Enviar por WebSocket
      await this.notificationsGateway.sendToUser(userId, notification);
      await this.notificationsGateway.updateUnreadCount(userId);

      return notification;
    } catch (error) {
      this.logger.error(`Error creating notification for user ${userId}:`, error);
    }
  }

  private async createBulkAndSend(
    userIds: string[],
    schoolId: string,
    data: NotificationData,
  ) {
    const notifications = [];
    for (const userId of userIds) {
      const notif = await this.createAndSend(userId, schoolId, data);
      if (notif) notifications.push(notif);
    }
    return notifications;
  }

  // ============================================
  // HELPER: Obtener destinatarios
  // ============================================

  private async getAdminsOfSchool(schoolId: string): Promise<string[]> {
    const admins = await this.prisma.user.findMany({
      where: { schoolId, role: Role.ADMIN, deletedAt: null },
      select: { id: true },
    });
    return admins.map(a => a.id);
  }

  private async getStudentsOfCourse(courseId: string): Promise<{ id: string; userId: string; schoolId: string }[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId, isActive: true },
      include: {
        student: {
          include: {
            user: { select: { id: true } },
            school: { select: { id: true } },
          },
        },
      },
    });
    return enrollments.map(e => ({
      id: e.student.id,
      userId: e.student.user.id,
      schoolId: e.student.school.id,
    }));
  }

  private async getParentsOfStudent(studentId: string): Promise<string[]> {
    const parentRelations = await this.prisma.parentStudent.findMany({
      where: { studentId },
      include: {
        parent: {
          include: {
            user: { select: { id: true } },
          },
        },
      },
    });
    return parentRelations.map((p: { parent: { user: { id: string } } }) => p.parent.user.id);
  }

  private async getParentsOfStudents(studentIds: string[]): Promise<string[]> {
    const allParents: string[] = [];
    for (const studentId of studentIds) {
      const parents = await this.getParentsOfStudent(studentId);
      allParents.push(...parents);
    }
    return [...new Set(allParents)]; // Eliminar duplicados
  }

  // ============================================
  // TAREAS
  // ============================================

  async onTaskCreated(task: {
    id: string;
    title: string;
    dueDate: Date;
    course: { id: string; name: string };
    teacher: { user: { firstName: string; lastName: string } };
  }, schoolId: string) {
    this.logger.log(`Task created: ${task.title}`);

    const students = await this.getStudentsOfCourse(task.course.id);
    const studentUserIds = students.map(s => s.userId);
    const studentIds = students.map(s => s.id);
    const parentUserIds = await this.getParentsOfStudents(studentIds);
    const adminUserIds = await this.getAdminsOfSchool(schoolId);

    const notification: NotificationData = {
      title: 'Nueva tarea asignada',
      message: `Se ha asignado la tarea "${task.title}" en ${task.course.name}. Fecha límite: ${task.dueDate.toLocaleDateString()}`,
      type: NotificationType.INFO,
      link: `/tasks/${task.id}`,
      metadata: { taskId: task.id, courseId: task.course.id },
    };

    // Notificar a estudiantes
    await this.createBulkAndSend(studentUserIds, schoolId, notification);

    // Notificar a padres
    await this.createBulkAndSend(parentUserIds, schoolId, {
      ...notification,
      message: `Se ha asignado una nueva tarea "${task.title}" a su hijo(a) en ${task.course.name}`,
    });

    // Notificar a admins
    await this.createBulkAndSend(adminUserIds, schoolId, {
      ...notification,
      title: 'Tarea creada',
      message: `${task.teacher.user.firstName} ${task.teacher.user.lastName} creó la tarea "${task.title}" en ${task.course.name}`,
    });
  }

  async onTaskGraded(submission: {
    id: string;
    score: number;
    task: { id: string; title: string; maxScore: number };
    student: { id: string; userId: string; user: { firstName: string; lastName: string } };
  }, schoolId: string) {
    this.logger.log(`Task graded: ${submission.task.title} for student ${submission.student.id}`);

    const parentUserIds = await this.getParentsOfStudent(submission.student.id);
    const adminUserIds = await this.getAdminsOfSchool(schoolId);

    const notification: NotificationData = {
      title: 'Tarea calificada',
      message: `Tu tarea "${submission.task.title}" ha sido calificada: ${submission.score}/${submission.task.maxScore}`,
      type: NotificationType.SUCCESS,
      link: `/tasks/${submission.task.id}`,
      metadata: { taskId: submission.task.id, score: submission.score },
    };

    // Notificar al estudiante
    await this.createAndSend(submission.student.userId, schoolId, notification);

    // Notificar a padres
    await this.createBulkAndSend(parentUserIds, schoolId, {
      ...notification,
      message: `La tarea "${submission.task.title}" de ${submission.student.user.firstName} ha sido calificada: ${submission.score}/${submission.task.maxScore}`,
    });

    // Notificar a admins
    await this.createBulkAndSend(adminUserIds, schoolId, {
      ...notification,
      title: 'Calificación registrada',
      message: `${submission.student.user.firstName} ${submission.student.user.lastName} obtuvo ${submission.score}/${submission.task.maxScore} en "${submission.task.title}"`,
    });
  }

  async onTaskDueDatePassed(task: {
    id: string;
    title: string;
    course: { id: string; name: string };
  }, studentsWithoutSubmission: { id: string; userId: string; user: { firstName: string; lastName: string } }[], schoolId: string) {
    this.logger.log(`Task due date passed: ${task.title}`);

    for (const student of studentsWithoutSubmission) {
      const parentUserIds = await this.getParentsOfStudent(student.id);

      const notification: NotificationData = {
        title: 'Tarea no entregada',
        message: `No entregaste la tarea "${task.title}" de ${task.course.name}`,
        type: NotificationType.WARNING,
        link: `/tasks/${task.id}`,
        metadata: { taskId: task.id },
      };

      // Notificar al estudiante
      await this.createAndSend(student.userId, schoolId, notification);

      // Notificar a padres
      await this.createBulkAndSend(parentUserIds, schoolId, {
        ...notification,
        message: `${student.user.firstName} no entregó la tarea "${task.title}" de ${task.course.name}`,
      });
    }

    // Notificar a admins
    const adminUserIds = await this.getAdminsOfSchool(schoolId);
    await this.createBulkAndSend(adminUserIds, schoolId, {
      title: 'Tareas no entregadas',
      message: `${studentsWithoutSubmission.length} estudiantes no entregaron la tarea "${task.title}"`,
      type: NotificationType.WARNING,
      link: `/tasks/${task.id}`,
      metadata: { taskId: task.id, count: studentsWithoutSubmission.length },
    });
  }

  // ============================================
  // EXÁMENES
  // ============================================

  async onExamCreated(exam: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    course: { id: string; name: string };
    teacher: { user: { firstName: string; lastName: string } };
  }, schoolId: string) {
    this.logger.log(`Exam created: ${exam.title}`);

    const students = await this.getStudentsOfCourse(exam.course.id);
    const studentUserIds = students.map(s => s.userId);
    const studentIds = students.map(s => s.id);
    const parentUserIds = await this.getParentsOfStudents(studentIds);
    const adminUserIds = await this.getAdminsOfSchool(schoolId);

    const notification: NotificationData = {
      title: 'Nuevo examen programado',
      message: `Se ha programado el examen "${exam.title}" en ${exam.course.name}. Fecha: ${exam.startDate.toLocaleDateString()}`,
      type: NotificationType.INFO,
      link: `/exams/${exam.id}`,
      metadata: { examId: exam.id, courseId: exam.course.id },
    };

    // Notificar a estudiantes
    await this.createBulkAndSend(studentUserIds, schoolId, notification);

    // Notificar a padres
    await this.createBulkAndSend(parentUserIds, schoolId, {
      ...notification,
      message: `Se ha programado un examen "${exam.title}" para su hijo(a) en ${exam.course.name}. Fecha: ${exam.startDate.toLocaleDateString()}`,
    });

    // Notificar a admins
    await this.createBulkAndSend(adminUserIds, schoolId, {
      ...notification,
      title: 'Examen programado',
      message: `${exam.teacher.user.firstName} ${exam.teacher.user.lastName} programó el examen "${exam.title}" en ${exam.course.name}`,
    });
  }

  async onExamGraded(attempt: {
    id: string;
    score: number;
    exam: { id: string; title: string; maxScore: number };
    student: { id: string; userId: string; user: { firstName: string; lastName: string } };
  }, schoolId: string) {
    this.logger.log(`Exam graded: ${attempt.exam.title} for student ${attempt.student.id}`);

    const parentUserIds = await this.getParentsOfStudent(attempt.student.id);
    const adminUserIds = await this.getAdminsOfSchool(schoolId);

    const notification: NotificationData = {
      title: 'Examen calificado',
      message: `Tu examen "${attempt.exam.title}" ha sido calificado: ${attempt.score}/${attempt.exam.maxScore}`,
      type: NotificationType.SUCCESS,
      link: `/exams/${attempt.exam.id}`,
      metadata: { examId: attempt.exam.id, score: attempt.score },
    };

    // Notificar al estudiante
    await this.createAndSend(attempt.student.userId, schoolId, notification);

    // Notificar a padres
    await this.createBulkAndSend(parentUserIds, schoolId, {
      ...notification,
      message: `El examen "${attempt.exam.title}" de ${attempt.student.user.firstName} ha sido calificado: ${attempt.score}/${attempt.exam.maxScore}`,
    });

    // Notificar a admins
    await this.createBulkAndSend(adminUserIds, schoolId, {
      ...notification,
      title: 'Calificación de examen',
      message: `${attempt.student.user.firstName} ${attempt.student.user.lastName} obtuvo ${attempt.score}/${attempt.exam.maxScore} en "${attempt.exam.title}"`,
    });
  }

  // ============================================
  // ASISTENCIA
  // ============================================

  async onAttendanceMarked(attendance: {
    id: string;
    status: AttendanceStatus;
    date: Date;
    student: { id: string; userId: string; user: { firstName: string; lastName: string } };
    gradeSection: { grade: number; section: string };
  }, schoolId: string) {
    this.logger.log(`Attendance marked: ${attendance.status} for student ${attendance.student.id}`);

    const parentUserIds = await this.getParentsOfStudent(attendance.student.id);
    const adminUserIds = await this.getAdminsOfSchool(schoolId);

    const statusMessages: Record<AttendanceStatus, { title: string; message: string; type: NotificationType }> = {
      PRESENT: {
        title: 'Asistencia registrada',
        message: `${attendance.student.user.firstName} llegó a tiempo hoy`,
        type: NotificationType.SUCCESS,
      },
      LATE: {
        title: 'Tardanza registrada',
        message: `${attendance.student.user.firstName} llegó tarde hoy`,
        type: NotificationType.WARNING,
      },
      ABSENT: {
        title: 'Falta registrada',
        message: `${attendance.student.user.firstName} faltó hoy`,
        type: NotificationType.ERROR,
      },
      EXCUSED: {
        title: 'Falta justificada',
        message: `${attendance.student.user.firstName} tiene falta justificada hoy`,
        type: NotificationType.INFO,
      },
    };

    const statusInfo = statusMessages[attendance.status];

    const notification: NotificationData = {
      title: statusInfo.title,
      message: statusInfo.message,
      type: statusInfo.type,
      link: `/attendance`,
      metadata: { attendanceId: attendance.id, status: attendance.status },
    };

    // Notificar a padres
    await this.createBulkAndSend(parentUserIds, schoolId, notification);

    // Notificar a admins
    await this.createBulkAndSend(adminUserIds, schoolId, {
      ...notification,
      message: `${attendance.student.user.firstName} ${attendance.student.user.lastName} - ${statusInfo.title.toLowerCase()} en ${attendance.gradeSection.grade}° ${attendance.gradeSection.section}`,
    });
  }

  // ============================================
  // PAGOS
  // ============================================

  async onPaymentConfirmed(payment: {
    id: string;
    amount: number;
    concept: { name: string };
    student: { id: string; user: { firstName: string; lastName: string } };
  }, schoolId: string) {
    this.logger.log(`Payment confirmed: ${payment.id}`);

    const parentUserIds = await this.getParentsOfStudent(payment.student.id);
    const adminUserIds = await this.getAdminsOfSchool(schoolId);

    const notification: NotificationData = {
      title: 'Pago confirmado',
      message: `Se ha confirmado el pago de S/ ${payment.amount} por concepto de "${payment.concept.name}" para ${payment.student.user.firstName}`,
      type: NotificationType.SUCCESS,
      link: `/payments/${payment.id}`,
      metadata: { paymentId: payment.id, amount: payment.amount },
    };

    // Notificar a padres
    await this.createBulkAndSend(parentUserIds, schoolId, notification);

    // Notificar a admins
    await this.createBulkAndSend(adminUserIds, schoolId, {
      ...notification,
      title: 'Pago recibido',
      message: `Pago recibido: S/ ${payment.amount} - ${payment.concept.name} - ${payment.student.user.firstName} ${payment.student.user.lastName}`,
    });
  }

  async onPaymentReminder(payment: {
    id: string;
    amount: number;
    dueDate: Date;
    daysUntilDue: number;
    concept: { name: string };
    student: { id: string; user: { firstName: string; lastName: string } };
  }, schoolId: string) {
    this.logger.log(`Payment reminder: ${payment.id} - ${payment.daysUntilDue} days`);

    const parentUserIds = await this.getParentsOfStudent(payment.student.id);
    const adminUserIds = await this.getAdminsOfSchool(schoolId);

    let title: string;
    let type: NotificationType;

    if (payment.daysUntilDue > 0) {
      title = `Recordatorio de pago - ${payment.daysUntilDue} días`;
      type = payment.daysUntilDue <= 3 ? NotificationType.WARNING : NotificationType.INFO;
    } else if (payment.daysUntilDue === 0) {
      title = 'Pago vence hoy';
      type = NotificationType.WARNING;
    } else {
      title = 'Pago vencido';
      type = NotificationType.ERROR;
    }

    const notification: NotificationData = {
      title,
      message: `El pago de S/ ${payment.amount} por "${payment.concept.name}" de ${payment.student.user.firstName} vence el ${payment.dueDate.toLocaleDateString()}`,
      type,
      link: `/payments/${payment.id}`,
      metadata: { paymentId: payment.id, daysUntilDue: payment.daysUntilDue },
    };

    // Notificar a padres
    await this.createBulkAndSend(parentUserIds, schoolId, notification);

    // Notificar a admins
    await this.createBulkAndSend(adminUserIds, schoolId, notification);
  }

  // ============================================
  // MENSAJES
  // ============================================

  async onNewMessage(message: {
    id: string;
    content: string;
    senderName: string;
    conversation: {
      id: string;
      studentName: string;
      participants: { teacherId?: string; parentId?: string }[];
    };
  }, senderId: string, schoolId: string) {
    this.logger.log(`New message in conversation: ${message.conversation.id}`);

    // Obtener todos los participantes excepto el remitente
    const recipientUserIds: string[] = [];

    for (const participant of message.conversation.participants) {
      if (participant.teacherId) {
        const teacher = await this.prisma.teacher.findUnique({
          where: { id: participant.teacherId },
          include: { user: { select: { id: true } } },
        });
        if (teacher && teacher.user.id !== senderId) {
          recipientUserIds.push(teacher.user.id);
        }
      }
      if (participant.parentId) {
        const parent = await this.prisma.parent.findUnique({
          where: { id: participant.parentId },
          include: { user: { select: { id: true } } },
        });
        if (parent && parent.user.id !== senderId) {
          recipientUserIds.push(parent.user.id);
        }
      }
    }

    const notification: NotificationData = {
      title: 'Nuevo mensaje',
      message: `${message.senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
      type: NotificationType.INFO,
      link: `/messages/${message.conversation.id}`,
      metadata: { conversationId: message.conversation.id, messageId: message.id },
    };

    // Notificar a todos los participantes excepto el remitente
    await this.createBulkAndSend(recipientUserIds, schoolId, notification);

    // Notificar a admins
    const adminUserIds = await this.getAdminsOfSchool(schoolId);
    const adminsToNotify = adminUserIds.filter(id => id !== senderId);
    await this.createBulkAndSend(adminsToNotify, schoolId, {
      ...notification,
      message: `Mensaje en conversación de ${message.conversation.studentName}: ${message.content.substring(0, 30)}...`,
    });
  }
}
