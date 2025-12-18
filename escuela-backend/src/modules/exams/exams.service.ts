import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateExamDto, UpdateExamDto, CreateQuestionDto, SubmitAnswerDto } from './dto';
import { Prisma } from '@prisma/client';
import { NotificationEventsService } from '../notifications/notification-events.service';

@Injectable()
export class ExamsService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
  ) {}

  async create(dto: CreateExamDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la de inicio');
    }

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

    const exam = await this.prisma.exam.create({
      data: {
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        duration: dto.duration || 60,
        maxScore: dto.maxScore || 20,
        weight: dto.weight || 1,
        startDate,
        endDate,
        isPublished: dto.isPublished || false,
        showResults: dto.showResults || false,
        shuffleQuestions: dto.shuffleQuestions || false,
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

    // Enviar notificaciones si el examen está publicado
    if (exam.isPublished && teacher) {
      await this.notificationEvents.onExamCreated(
        {
          id: exam.id,
          title: exam.title,
          startDate: exam.startDate,
          endDate: exam.endDate,
          course: exam.course,
          teacher: { user: teacher.user },
        },
        course.gradeSection.schoolId,
      );
    }

    return exam;
  }

  async findAll(courseId?: string, teacherId?: string, isPublished?: boolean) {
    const where: Record<string, unknown> = {};

    if (courseId) where.courseId = courseId;
    if (teacherId) where.teacherId = teacherId;
    if (isPublished !== undefined) where.isPublished = isPublished;

    return this.prisma.exam.findMany({
      where,
      select: {
        id: true,
        title: true,
        duration: true,
        maxScore: true,
        weight: true,
        startDate: true,
        endDate: true,
        isPublished: true,
        showResults: true,
        course: { select: { id: true, name: true } },
        teacher: {
          select: { user: { select: { firstName: true, lastName: true } } },
        },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const exam = await this.prisma.exam.findUnique({
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
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            type: true,
            options: true,
            points: true,
            order: true,
          },
        },
        _count: { select: { attempts: true } },
      },
    });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    return exam;
  }

  async update(id: string, dto: UpdateExamDto) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    if (dto.startDate && dto.endDate) {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);
      if (endDate <= startDate) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la de inicio');
      }
    }

    return this.prisma.exam.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        duration: dto.duration,
        maxScore: dto.maxScore,
        weight: dto.weight,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        isPublished: dto.isPublished,
        showResults: dto.showResults,
        shuffleQuestions: dto.shuffleQuestions,
      },
      include: {
        course: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { _count: { select: { attempts: true } } },
    });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    if (exam._count.attempts > 0) {
      throw new BadRequestException('No se puede eliminar un examen con intentos');
    }

    await this.prisma.exam.delete({ where: { id } });
    return { message: 'Examen eliminado exitosamente' };
  }

  async publish(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        _count: { select: { questions: true } },
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

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    if (exam._count.questions === 0) {
      throw new BadRequestException('El examen debe tener al menos una pregunta');
    }

    const updatedExam = await this.prisma.exam.update({
      where: { id },
      data: { isPublished: true },
      select: { id: true, title: true, isPublished: true, startDate: true, endDate: true },
    });

    // Enviar notificaciones
    await this.notificationEvents.onExamCreated(
      {
        id: exam.id,
        title: exam.title,
        startDate: exam.startDate,
        endDate: exam.endDate,
        course: { id: exam.course.id, name: exam.course.name },
        teacher: exam.teacher,
      },
      exam.course.gradeSection.schoolId,
    );

    return updatedExam;
  }

  // ==================== QUESTIONS ====================

  async addQuestion(examId: string, dto: CreateQuestionDto) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    const lastQuestion = await this.prisma.examQuestion.findFirst({
      where: { examId },
      orderBy: { order: 'desc' },
    });

    return this.prisma.examQuestion.create({
      data: {
        examId,
        question: dto.question,
        type: dto.type,
        options: dto.options ?? Prisma.JsonNull,
        correctAnswer: dto.correctAnswer,
        points: dto.points || 1,
        order: dto.order ?? (lastQuestion ? lastQuestion.order + 1 : 1),
      },
    });
  }

  async updateQuestion(questionId: string, dto: CreateQuestionDto) {
    const question = await this.prisma.examQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Pregunta no encontrada');
    }

    return this.prisma.examQuestion.update({
      where: { id: questionId },
      data: {
        question: dto.question,
        type: dto.type,
        options: dto.options,
        correctAnswer: dto.correctAnswer,
        points: dto.points,
        order: dto.order,
      },
    });
  }

  async removeQuestion(questionId: string) {
    const question = await this.prisma.examQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Pregunta no encontrada');
    }

    await this.prisma.examQuestion.delete({ where: { id: questionId } });
    return { message: 'Pregunta eliminada' };
  }

  // ==================== ATTEMPTS ====================

  async startAttempt(examId: string, studentId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    if (!exam.isPublished) {
      throw new ForbiddenException('El examen no está publicado');
    }

    const now = new Date();
    if (now < exam.startDate) {
      throw new ForbiddenException('El examen aún no ha comenzado');
    }
    if (now > exam.endDate) {
      throw new ForbiddenException('El examen ha finalizado');
    }

    // Verificar matriculación
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId, courseId: exam.courseId, isActive: true },
    });

    if (!enrollment) {
      throw new ForbiddenException('No estás matriculado en este curso');
    }

    // Verificar intento existente
    const existingAttempt = await this.prisma.examAttempt.findFirst({
      where: { examId, studentId },
    });

    if (existingAttempt) {
      if (existingAttempt.isCompleted) {
        throw new BadRequestException('Ya completaste este examen');
      }
      return existingAttempt;
    }

    return this.prisma.examAttempt.create({
      data: {
        examId,
        studentId,
      },
      include: {
        exam: {
          select: {
            title: true,
            duration: true,
            questions: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                question: true,
                type: true,
                options: true,
                points: true,
              },
            },
          },
        },
      },
    });
  }

  async submitAnswer(attemptId: string, dto: SubmitAnswerDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException('Intento no encontrado');
    }

    if (attempt.isCompleted) {
      throw new BadRequestException('El examen ya fue completado');
    }

    return this.prisma.examAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: dto.questionId,
        },
      },
      create: {
        attemptId,
        questionId: dto.questionId,
        answer: dto.answer,
      },
      update: {
        answer: dto.answer,
      },
    });
  }

  async finishAttempt(attemptId: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: true,
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
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Intento no encontrado');
    }

    if (attempt.isCompleted) {
      throw new BadRequestException('El examen ya fue completado');
    }

    // Calcular puntaje
    let totalScore = 0;
    for (const question of attempt.exam.questions) {
      const answer = attempt.answers.find((a) => a.questionId === question.id);
      if (answer && answer.answer === question.correctAnswer) {
        totalScore += question.points;
      }
    }

    const updatedAttempt = await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        isCompleted: true,
        finishedAt: new Date(),
        score: totalScore,
      },
      include: {
        exam: { select: { title: true, maxScore: true, showResults: true } },
      },
    });

    // Enviar notificación de examen calificado
    await this.notificationEvents.onExamGraded(
      {
        id: attempt.id,
        score: totalScore,
        exam: {
          id: attempt.exam.id,
          title: attempt.exam.title,
          maxScore: attempt.exam.maxScore,
        },
        student: {
          id: attempt.studentId,
          userId: attempt.student.user.id,
          user: attempt.student.user,
        },
      },
      attempt.exam.course.gradeSection.schoolId,
    );

    return updatedAttempt;
  }

  async getAttempts(examId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    return this.prisma.examAttempt.findMany({
      where: { examId },
      select: {
        id: true,
        startedAt: true,
        finishedAt: true,
        score: true,
        isCompleted: true,
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

  async getStudentAttempt(examId: string, studentId: string) {
    const attempt = await this.prisma.examAttempt.findFirst({
      where: { examId, studentId },
      include: {
        exam: {
          select: { title: true, maxScore: true, showResults: true },
        },
        answers: {
          include: {
            question: {
              select: { question: true, type: true, points: true, correctAnswer: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('No has iniciado este examen');
    }

    return attempt;
  }

  async getExamStats(examId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { course: { select: { _count: { select: { enrollments: true } } } } },
    });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    const attempts = await this.prisma.examAttempt.aggregate({
      where: { examId, isCompleted: true },
      _count: true,
      _avg: { score: true },
      _max: { score: true },
      _min: { score: true },
    });

    const totalEnrolled = exam.course._count.enrollments;

    return {
      examId,
      title: exam.title,
      maxScore: exam.maxScore,
      totalEnrolled,
      totalAttempts: attempts._count,
      pending: totalEnrolled - attempts._count,
      grades: {
        average: attempts._avg.score,
        max: attempts._max.score,
        min: attempts._min.score,
      },
    };
  }
}
