import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSubjectDto) {
    // Verificar código único por escuela
    const existing = await this.prisma.subject.findUnique({
      where: {
        schoolId_code: {
          schoolId: dto.schoolId,
          code: dto.code.toUpperCase(),
        },
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe una materia con ese código en esta escuela');
    }

    return this.prisma.subject.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        description: dto.description,
        color: dto.color,
        schoolId: dto.schoolId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        color: true,
        isActive: true,
        schoolId: true,
        createdAt: true,
      },
    });
  }

  async findAll(schoolId?: string, search?: string, isActive?: boolean) {
    const where: Record<string, unknown> = {};

    if (schoolId) where.schoolId = schoolId;
    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.subject.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        color: true,
        isActive: true,
        schoolId: true,
        createdAt: true,
        _count: {
          select: {
            courses: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        color: true,
        isActive: true,
        schoolId: true,
        school: {
          select: { id: true, name: true },
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Materia no encontrada');
    }

    return subject;
  }

  async update(id: string, dto: UpdateSubjectDto) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Materia no encontrada');
    }

    // Verificar código único si se está cambiando
    if (dto.code && dto.code.toUpperCase() !== subject.code) {
      const existing = await this.prisma.subject.findUnique({
        where: {
          schoolId_code: {
            schoolId: subject.schoolId,
            code: dto.code.toUpperCase(),
          },
        },
      });

      if (existing) {
        throw new ConflictException('Ya existe una materia con ese código');
      }
    }

    return this.prisma.subject.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code?.toUpperCase(),
        description: dto.description,
        color: dto.color,
        isActive: dto.isActive,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        color: true,
        isActive: true,
        schoolId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Materia no encontrada');
    }

    // No eliminar si tiene cursos
    if (subject._count.courses > 0) {
      // Soft delete
      await this.prisma.subject.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Materia desactivada (tiene cursos asociados)' };
    }

    await this.prisma.subject.delete({ where: { id } });
    return { message: 'Materia eliminada exitosamente' };
  }

  async getCourses(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Materia no encontrada');
    }

    return this.prisma.course.findMany({
      where: { subjectId: id, isActive: true },
      select: {
        id: true,
        name: true,
        gradeSection: {
          select: {
            id: true,
            grade: true,
            section: true,
            level: true,
          },
        },
        teacher: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        academicYear: {
          select: { id: true, name: true, isCurrent: true },
        },
        hoursPerWeek: true,
      },
    });
  }
}
