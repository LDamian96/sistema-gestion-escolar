import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  private readonly dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  async create(dto: CreateScheduleDto) {
    // Verificar que el curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar que la sección existe
    const gradeSection = await this.prisma.gradeSection.findUnique({
      where: { id: dto.gradeSectionId },
    });
    if (!gradeSection) {
      throw new NotFoundException('Sección no encontrada');
    }

    // Validar que la hora de fin sea mayor que la de inicio
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('La hora de fin debe ser mayor que la hora de inicio');
    }

    // Verificar conflictos de horario en la misma sección
    const conflict = await this.checkScheduleConflict(
      dto.gradeSectionId,
      dto.dayOfWeek,
      dto.startTime,
      dto.endTime,
    );
    if (conflict) {
      throw new BadRequestException(
        `Conflicto de horario: Ya existe una clase de ${conflict.course.subject.name} en ese horario`,
      );
    }

    return this.prisma.schedule.create({
      data: {
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        room: dto.room,
        courseId: dto.courseId,
        gradeSectionId: dto.gradeSectionId,
      },
      include: {
        course: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
        gradeSection: true,
      },
    });
  }

  async findAll(gradeSectionId?: string, courseId?: string, dayOfWeek?: number) {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        ...(gradeSectionId && { gradeSectionId }),
        ...(courseId && { courseId }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
      },
      include: {
        course: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
        gradeSection: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return schedules.map(s => ({
      ...s,
      dayName: this.dayNames[s.dayOfWeek],
    }));
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
        gradeSection: true,
      },
    });
    if (!schedule) {
      throw new NotFoundException('Horario no encontrado');
    }
    return {
      ...schedule,
      dayName: this.dayNames[schedule.dayOfWeek],
    };
  }

  async update(id: string, dto: UpdateScheduleDto) {
    const existing = await this.prisma.schedule.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Horario no encontrado');
    }

    const newStartTime = dto.startTime || existing.startTime;
    const newEndTime = dto.endTime || existing.endTime;
    const newDayOfWeek = dto.dayOfWeek ?? existing.dayOfWeek;

    // Validar que la hora de fin sea mayor que la de inicio
    if (newStartTime >= newEndTime) {
      throw new BadRequestException('La hora de fin debe ser mayor que la hora de inicio');
    }

    // Verificar conflictos (excluyendo el horario actual)
    const conflict = await this.checkScheduleConflict(
      existing.gradeSectionId,
      newDayOfWeek,
      newStartTime,
      newEndTime,
      id,
    );
    if (conflict) {
      throw new BadRequestException(
        `Conflicto de horario: Ya existe una clase de ${conflict.course.subject.name} en ese horario`,
      );
    }

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        ...(dto.dayOfWeek !== undefined && { dayOfWeek: dto.dayOfWeek }),
        ...(dto.startTime && { startTime: dto.startTime }),
        ...(dto.endTime && { endTime: dto.endTime }),
        ...(dto.room !== undefined && { room: dto.room }),
      },
      include: {
        course: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
        gradeSection: true,
      },
    });

    return {
      ...updated,
      dayName: this.dayNames[updated.dayOfWeek],
    };
  }

  async remove(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });
    if (!schedule) {
      throw new NotFoundException('Horario no encontrado');
    }

    await this.prisma.schedule.delete({ where: { id } });
    return { message: 'Horario eliminado exitosamente' };
  }

  async findByGradeSection(gradeSectionId: string) {
    const gradeSection = await this.prisma.gradeSection.findUnique({
      where: { id: gradeSectionId },
    });
    if (!gradeSection) {
      throw new NotFoundException('Sección no encontrada');
    }

    const schedules = await this.findAll(gradeSectionId);

    // Agrupar por día
    const byDay: Record<string, typeof schedules> = {};
    for (const day of this.dayNames) {
      byDay[day] = [];
    }
    for (const schedule of schedules) {
      byDay[schedule.dayName].push(schedule);
    }

    return {
      gradeSection,
      schedules: byDay,
    };
  }

  async findByTeacher(teacherId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });
    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }

    // Obtener cursos del profesor
    const courses = await this.prisma.course.findMany({
      where: { teacherId },
      select: { id: true },
    });

    const courseIds = courses.map(c => c.id);

    const schedules = await this.prisma.schedule.findMany({
      where: {
        courseId: { in: courseIds },
      },
      include: {
        course: {
          include: {
            subject: true,
          },
        },
        gradeSection: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    // Agrupar por día
    const byDay: Record<string, typeof schedules & { dayName: string }[]> = {};
    for (const day of this.dayNames) {
      byDay[day] = [];
    }
    for (const schedule of schedules) {
      const dayName = this.dayNames[schedule.dayOfWeek];
      byDay[dayName].push({ ...schedule, dayName });
    }

    return {
      teacher: {
        id: teacher.id,
        name: `${teacher.user.firstName} ${teacher.user.lastName}`,
      },
      schedules: byDay,
    };
  }

  private async checkScheduleConflict(
    gradeSectionId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        gradeSectionId,
        dayOfWeek,
        ...(excludeId && { id: { not: excludeId } }),
      },
      include: {
        course: {
          include: {
            subject: true,
          },
        },
      },
    });

    // Verificar solapamiento de horarios
    for (const schedule of schedules) {
      const existingStart = schedule.startTime;
      const existingEnd = schedule.endTime;

      // Hay conflicto si:
      // - El nuevo inicio está dentro del horario existente
      // - El nuevo fin está dentro del horario existente
      // - El nuevo horario engloba al existente
      if (
        (startTime >= existingStart && startTime < existingEnd) ||
        (endTime > existingStart && endTime <= existingEnd) ||
        (startTime <= existingStart && endTime >= existingEnd)
      ) {
        return schedule;
      }
    }

    return null;
  }
}
