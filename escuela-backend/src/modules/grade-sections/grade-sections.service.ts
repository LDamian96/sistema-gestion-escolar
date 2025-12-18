import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateGradeSectionDto, UpdateGradeSectionDto } from './dto';
import { Level } from '@prisma/client';

@Injectable()
export class GradeSectionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGradeSectionDto) {
    // Verificar combinación única
    const existing = await this.prisma.gradeSection.findUnique({
      where: {
        schoolId_academicYearId_grade_section_level: {
          schoolId: dto.schoolId,
          academicYearId: dto.academicYearId,
          grade: dto.grade,
          section: dto.section.toUpperCase(),
          level: dto.level,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Esta sección ya existe para el año académico seleccionado');
    }

    return this.prisma.gradeSection.create({
      data: {
        grade: dto.grade,
        section: dto.section.toUpperCase(),
        level: dto.level,
        capacity: dto.capacity || 30,
        classroom: dto.classroom,
        schoolId: dto.schoolId,
        academicYearId: dto.academicYearId,
      },
      select: {
        id: true,
        grade: true,
        section: true,
        level: true,
        capacity: true,
        classroom: true,
        isActive: true,
        schoolId: true,
        academicYearId: true,
        createdAt: true,
      },
    });
  }

  async findAll(
    schoolId?: string,
    academicYearId?: string,
    level?: Level,
    isActive?: boolean,
  ) {
    const where: Record<string, unknown> = {};

    if (schoolId) where.schoolId = schoolId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (level) where.level = level;
    if (isActive !== undefined) where.isActive = isActive;

    return this.prisma.gradeSection.findMany({
      where,
      select: {
        id: true,
        grade: true,
        section: true,
        level: true,
        capacity: true,
        classroom: true,
        isActive: true,
        schoolId: true,
        academicYearId: true,
        academicYear: {
          select: { name: true, isCurrent: true },
        },
        createdAt: true,
        _count: {
          select: {
            students: true,
            courses: true,
          },
        },
      },
      orderBy: [{ level: 'asc' }, { grade: 'asc' }, { section: 'asc' }],
    });
  }

  async findOne(id: string) {
    const gradeSection = await this.prisma.gradeSection.findUnique({
      where: { id },
      select: {
        id: true,
        grade: true,
        section: true,
        level: true,
        capacity: true,
        classroom: true,
        isActive: true,
        schoolId: true,
        academicYearId: true,
        school: {
          select: { id: true, name: true },
        },
        academicYear: {
          select: { id: true, name: true, isCurrent: true },
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            students: true,
            courses: true,
            attendances: true,
          },
        },
      },
    });

    if (!gradeSection) {
      throw new NotFoundException('Sección no encontrada');
    }

    return gradeSection;
  }

  async update(id: string, dto: UpdateGradeSectionDto) {
    const gradeSection = await this.prisma.gradeSection.findUnique({
      where: { id },
    });

    if (!gradeSection) {
      throw new NotFoundException('Sección no encontrada');
    }

    // Si cambia grado/sección/nivel, verificar unicidad
    if (dto.grade !== undefined || dto.section !== undefined || dto.level !== undefined) {
      const newGrade = dto.grade ?? gradeSection.grade;
      const newSection = (dto.section ?? gradeSection.section).toUpperCase();
      const newLevel = dto.level ?? gradeSection.level;

      const existing = await this.prisma.gradeSection.findFirst({
        where: {
          schoolId: gradeSection.schoolId,
          academicYearId: gradeSection.academicYearId,
          grade: newGrade,
          section: newSection,
          level: newLevel,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Esta sección ya existe para el año académico');
      }
    }

    return this.prisma.gradeSection.update({
      where: { id },
      data: {
        grade: dto.grade,
        section: dto.section?.toUpperCase(),
        level: dto.level,
        capacity: dto.capacity,
        classroom: dto.classroom,
        isActive: dto.isActive,
      },
      select: {
        id: true,
        grade: true,
        section: true,
        level: true,
        capacity: true,
        classroom: true,
        isActive: true,
        schoolId: true,
        academicYearId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const gradeSection = await this.prisma.gradeSection.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true, courses: true },
        },
      },
    });

    if (!gradeSection) {
      throw new NotFoundException('Sección no encontrada');
    }

    // No eliminar si tiene datos asociados
    if (gradeSection._count.students > 0 || gradeSection._count.courses > 0) {
      // Soft delete
      await this.prisma.gradeSection.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Sección desactivada (tiene estudiantes o cursos asociados)' };
    }

    await this.prisma.gradeSection.delete({ where: { id } });
    return { message: 'Sección eliminada exitosamente' };
  }

  async getStudents(id: string) {
    const gradeSection = await this.prisma.gradeSection.findUnique({
      where: { id },
    });

    if (!gradeSection) {
      throw new NotFoundException('Sección no encontrada');
    }

    return this.prisma.student.findMany({
      where: { gradeSectionId: id, isActive: true },
      select: {
        id: true,
        studentCode: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: { lastName: 'asc' },
      },
    });
  }

  async getCourses(id: string) {
    const gradeSection = await this.prisma.gradeSection.findUnique({
      where: { id },
    });

    if (!gradeSection) {
      throw new NotFoundException('Sección no encontrada');
    }

    return this.prisma.course.findMany({
      where: { gradeSectionId: id, isActive: true },
      select: {
        id: true,
        name: true,
        subject: {
          select: { id: true, name: true, code: true },
        },
        teacher: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        hoursPerWeek: true,
      },
    });
  }
}
