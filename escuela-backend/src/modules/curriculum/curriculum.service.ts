import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateCurriculumTopicDto,
  UpdateCurriculumTopicDto,
  QueryCurriculumDto,
  CreateMonthlyTopicDto,
} from './dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class CurriculumService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCurriculumTopicDto, userId: string, userRole: Role) {
    if (userRole === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId },
      });
      if (!teacher || teacher.id !== dto.teacherId) {
        throw new ForbiddenException('No tienes permiso para crear temas en este curso');
      }
    }

    return this.prisma.curriculumTopic.create({
      data: {
        unit: dto.unit,
        title: dto.title,
        description: dto.description,
        objectives: dto.objectives || [],
        estimatedHours: dto.estimatedHours || 2,
        month: dto.month,
        status: dto.status,
        attachmentUrl: dto.attachmentUrl,
        attachmentName: dto.attachmentName,
        courseId: dto.courseId,
        teacherId: dto.teacherId,
      },
      include: {
        course: {
          select: { name: true },
        },
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  async findAll(query: QueryCurriculumDto) {
    const { courseId, teacherId, month, unit, status, page = 1, limit = 20 } = query;

    const where: Prisma.CurriculumTopicWhereInput = {
      ...(courseId && { courseId }),
      ...(teacherId && { teacherId }),
      ...(month && { month }),
      ...(unit && { unit }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.curriculumTopic.findMany({
        where,
        include: {
          course: {
            select: { name: true },
          },
          teacher: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          monthlyTopics: true,
        },
        orderBy: [{ unit: 'asc' }, { month: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.curriculumTopic.count({ where }),
    ]);

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

  async findOne(id: string) {
    const topic = await this.prisma.curriculumTopic.findUnique({
      where: { id },
      include: {
        course: {
          select: { name: true, gradeSectionId: true },
        },
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        monthlyTopics: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Tema curricular no encontrado');
    }

    return topic;
  }

  async findByCourse(courseId: string) {
    return this.prisma.curriculumTopic.findMany({
      where: { courseId },
      include: {
        monthlyTopics: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: [{ unit: 'asc' }, { month: 'asc' }],
    });
  }

  async update(id: string, dto: UpdateCurriculumTopicDto, userId: string, userRole: Role) {
    const topic = await this.findOne(id);

    if (userRole === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId },
      });
      if (!teacher || teacher.id !== topic.teacherId) {
        throw new ForbiddenException('No tienes permiso para editar este tema');
      }
    }

    return this.prisma.curriculumTopic.update({
      where: { id },
      data: {
        ...(dto.unit && { unit: dto.unit }),
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.objectives && { objectives: dto.objectives }),
        ...(dto.estimatedHours && { estimatedHours: dto.estimatedHours }),
        ...(dto.month && { month: dto.month }),
        ...(dto.status && { status: dto.status }),
        ...(dto.attachmentUrl !== undefined && { attachmentUrl: dto.attachmentUrl }),
        ...(dto.attachmentName !== undefined && { attachmentName: dto.attachmentName }),
      },
      include: {
        course: {
          select: { name: true },
        },
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const topic = await this.findOne(id);

    if (userRole === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId },
      });
      if (!teacher || teacher.id !== topic.teacherId) {
        throw new ForbiddenException('No tienes permiso para eliminar este tema');
      }
    }

    await this.prisma.curriculumTopic.delete({ where: { id } });
    return { message: 'Tema curricular eliminado' };
  }

  async createMonthlyTopic(dto: CreateMonthlyTopicDto) {
    return this.prisma.monthlyTopic.create({
      data: {
        date: new Date(dto.date),
        month: dto.month,
        year: dto.year,
        title: dto.title,
        description: dto.description,
        attachmentUrl: dto.attachmentUrl,
        attachmentName: dto.attachmentName,
        curriculumTopicId: dto.curriculumTopicId,
        courseId: dto.courseId,
        teacherId: dto.teacherId,
      },
      include: {
        curriculumTopic: {
          select: { title: true, unit: true },
        },
        course: {
          select: { name: true },
        },
      },
    });
  }

  async updateMonthlyTopic(id: string, data: Partial<CreateMonthlyTopicDto>) {
    return this.prisma.monthlyTopic.update({
      where: { id },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.month && { month: data.month }),
        ...(data.year && { year: data.year }),
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.attachmentUrl !== undefined && { attachmentUrl: data.attachmentUrl }),
        ...(data.attachmentName !== undefined && { attachmentName: data.attachmentName }),
      },
    });
  }

  async getProgress(courseId: string) {
    const topics = await this.prisma.curriculumTopic.findMany({
      where: { courseId },
      include: {
        monthlyTopics: true,
      },
    });

    const totalTopics = topics.length;
    const completedTopics = topics.filter((t) => t.status === 'TAUGHT').length;
    const totalHours = topics.reduce((sum, t) => sum + t.estimatedHours, 0);
    const completedHours = topics
      .filter((t) => t.status === 'TAUGHT')
      .reduce((sum, t) => sum + t.estimatedHours, 0);

    return {
      totalTopics,
      completedTopics,
      pendingTopics: totalTopics - completedTopics,
      progress: totalTopics > 0 ? ((completedTopics / totalTopics) * 100).toFixed(2) : 0,
      totalHours,
      completedHours,
      remainingHours: totalHours - completedHours,
    };
  }
}
