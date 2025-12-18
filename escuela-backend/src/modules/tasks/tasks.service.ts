import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto, UpdateTaskDto, SubmitTaskDto, GradeSubmissionDto } from './dto';
import { SubmissionStatus } from '@prisma/client';
import { NotificationEventsService } from '../notifications/notification-events.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
  ) {}

  async create(dto: CreateTaskDto) {
    // Verificar curso y profesor
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      include: { gradeSection: { select: { schoolId: true } } },
    });
    if (!course) {
      throw new BadRequestException('El curso no existe');
    }

    const teacher = await this.prisma.teacher.findUnique({
      where: { id: dto.teacherId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (!teacher) {
      throw new BadRequestException('El profesor no existe');
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        type: dto.type,
        submissionType: dto.submissionType,
        maxScore: dto.maxScore || 20,
        weight: dto.weight || 1,
        dueDate: new Date(dto.dueDate),
        allowLate: dto.allowLate ?? true,
        latePenalty: dto.latePenalty || 0,
        attachments: dto.attachments || [],
        isPublished: dto.isPublished || false,
        courseId: dto.courseId,
        teacherId: dto.teacherId,
      },
      include: {
        course: { select: { id: true, name: true } },
        teacher: {
          select: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    // Enviar notificaciones si la tarea está publicada
    if (task.isPublished) {
      await this.notificationEvents.onTaskCreated(
        {
          id: task.id,
          title: task.title,
          dueDate: task.dueDate,
          course: task.course,
          teacher: { user: teacher.user },
        },
        course.gradeSection.schoolId,
      );
    }

    return task;
  }

  async findAll(
    courseId?: string,
    teacherId?: string,
    isPublished?: boolean,
  ) {
    const where: Record<string, unknown> = {};

    if (courseId) where.courseId = courseId;
    if (teacherId) where.teacherId = teacherId;
    if (isPublished !== undefined) where.isPublished = isPublished;

    return this.prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        type: true,
        submissionType: true,
        maxScore: true,
        weight: true,
        dueDate: true,
        allowLate: true,
        isPublished: true,
        createdAt: true,
        course: { select: { id: true, name: true } },
        teacher: {
          select: { user: { select: { firstName: true, lastName: true } } },
        },
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            gradeSection: { select: { grade: true, section: true, level: true } },
          },
        },
        teacher: {
          select: { user: { select: { firstName: true, lastName: true } } },
        },
        _count: { select: { submissions: true } },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        type: dto.type,
        submissionType: dto.submissionType,
        maxScore: dto.maxScore,
        weight: dto.weight,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        allowLate: dto.allowLate,
        latePenalty: dto.latePenalty,
        attachments: dto.attachments,
        isPublished: dto.isPublished,
      },
      include: {
        course: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { _count: { select: { submissions: true } } },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    if (task._count.submissions > 0) {
      throw new BadRequestException('No se puede eliminar una tarea con entregas');
    }

    await this.prisma.task.delete({ where: { id } });
    return { message: 'Tarea eliminada exitosamente' };
  }

  async publish(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            gradeSection: { select: { schoolId: true } },
          },
        },
        teacher: {
          select: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: { isPublished: true },
      select: { id: true, title: true, isPublished: true, dueDate: true },
    });

    // Enviar notificaciones
    await this.notificationEvents.onTaskCreated(
      {
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        course: { id: task.course.id, name: task.course.name },
        teacher: task.teacher,
      },
      task.course.gradeSection.schoolId,
    );

    return updatedTask;
  }

  // ==================== SUBMISSIONS ====================

  async getSubmissions(taskId: string, status?: SubmissionStatus) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const where: Record<string, unknown> = { taskId };
    if (status) where.status = status;

    return this.prisma.taskSubmission.findMany({
      where,
      select: {
        id: true,
        content: true,
        attachments: true,
        score: true,
        feedback: true,
        status: true,
        submittedAt: true,
        gradedAt: true,
        student: {
          select: {
            id: true,
            studentCode: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { student: { user: { lastName: 'asc' } } },
    });
  }

  async submitTask(taskId: string, studentId: string, dto: SubmitTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    if (!task.isPublished) {
      throw new ForbiddenException('La tarea no está publicada');
    }

    // Verificar estudiante matriculado
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId, courseId: task.courseId, isActive: true },
    });

    if (!enrollment) {
      throw new ForbiddenException('No estás matriculado en este curso');
    }

    const now = new Date();
    const isLate = now > task.dueDate;

    if (isLate && !task.allowLate) {
      throw new BadRequestException('No se permiten entregas tardías');
    }

    const status = isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;

    return this.prisma.taskSubmission.upsert({
      where: {
        taskId_studentId: { taskId, studentId },
      },
      create: {
        taskId,
        studentId,
        content: dto.content,
        attachments: dto.attachments || [],
        status,
        submittedAt: now,
      },
      update: {
        content: dto.content,
        attachments: dto.attachments || [],
        status,
        submittedAt: now,
      },
      include: {
        task: { select: { title: true, maxScore: true } },
      },
    });
  }

  async gradeSubmission(submissionId: string, dto: GradeSubmissionDto) {
    const submission = await this.prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          include: {
            course: {
              select: { gradeSection: { select: { schoolId: true } } },
            },
          },
        },
        student: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Entrega no encontrada');
    }

    if (dto.score > submission.task.maxScore) {
      throw new BadRequestException(
        `La calificación no puede ser mayor a ${submission.task.maxScore}`,
      );
    }

    const updatedSubmission = await this.prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        score: dto.score,
        feedback: dto.feedback,
        status: SubmissionStatus.GRADED,
        gradedAt: new Date(),
      },
      include: {
        student: {
          select: {
            studentCode: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        task: { select: { title: true, maxScore: true } },
      },
    });

    // Enviar notificación de tarea calificada
    await this.notificationEvents.onTaskGraded(
      {
        id: submission.id,
        score: dto.score,
        task: {
          id: submission.task.id,
          title: submission.task.title,
          maxScore: submission.task.maxScore,
        },
        student: {
          id: submission.studentId,
          userId: submission.student.user.id,
          user: submission.student.user,
        },
      },
      submission.task.course.gradeSection.schoolId,
    );

    return updatedSubmission;
  }

  async getStudentSubmission(taskId: string, studentId: string) {
    const submission = await this.prisma.taskSubmission.findUnique({
      where: {
        taskId_studentId: { taskId, studentId },
      },
      include: {
        task: {
          select: {
            title: true,
            maxScore: true,
            dueDate: true,
            allowLate: true,
            latePenalty: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('No has entregado esta tarea');
    }

    return submission;
  }

  async getTaskStats(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { course: { select: { _count: { select: { enrollments: true } } } } },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const submissions = await this.prisma.taskSubmission.groupBy({
      by: ['status'],
      where: { taskId },
      _count: true,
    });

    const graded = await this.prisma.taskSubmission.aggregate({
      where: { taskId, status: SubmissionStatus.GRADED },
      _avg: { score: true },
      _max: { score: true },
      _min: { score: true },
    });

    const totalEnrolled = task.course._count.enrollments;
    const totalSubmitted = submissions.reduce((acc, s) => acc + s._count, 0);

    return {
      taskId,
      title: task.title,
      maxScore: task.maxScore,
      totalEnrolled,
      totalSubmitted,
      pending: totalEnrolled - totalSubmitted,
      byStatus: submissions.reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {} as Record<string, number>),
      grades: {
        average: graded._avg.score,
        max: graded._max.score,
        min: graded._min.score,
      },
    };
  }
}
