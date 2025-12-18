import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto';

@Injectable()
export class AcademicYearsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAcademicYearDto) {
    // Validar fechas
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Si es el año actual, desmarcar otros
    if (dto.isCurrent) {
      await this.prisma.academicYear.updateMany({
        where: { schoolId: dto.schoolId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return this.prisma.academicYear.create({
      data: {
        name: dto.name,
        startDate,
        endDate,
        isCurrent: dto.isCurrent || false,
        schoolId: dto.schoolId,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        schoolId: true,
        createdAt: true,
      },
    });
  }

  async findAll(schoolId?: string) {
    const where: Record<string, unknown> = {};

    if (schoolId) {
      where.schoolId = schoolId;
    }

    return this.prisma.academicYear.findMany({
      where,
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        schoolId: true,
        school: {
          select: { name: true },
        },
        createdAt: true,
        _count: {
          select: {
            courses: true,
            gradeSections: true,
          },
        },
      },
      orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
    });
  }

  async findOne(id: string) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        schoolId: true,
        school: {
          select: { id: true, name: true },
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            courses: true,
            gradeSections: true,
          },
        },
      },
    });

    if (!academicYear) {
      throw new NotFoundException('Año académico no encontrado');
    }

    return academicYear;
  }

  async findCurrent(schoolId: string) {
    const academicYear = await this.prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        schoolId: true,
      },
    });

    if (!academicYear) {
      throw new NotFoundException('No hay año académico actual configurado');
    }

    return academicYear;
  }

  async update(id: string, dto: UpdateAcademicYearDto) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException('Año académico no encontrado');
    }

    // Validar fechas si se actualizan
    if (dto.startDate || dto.endDate) {
      const startDate = dto.startDate ? new Date(dto.startDate) : academicYear.startDate;
      const endDate = dto.endDate ? new Date(dto.endDate) : academicYear.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    // Si se marca como actual, desmarcar otros
    if (dto.isCurrent) {
      await this.prisma.academicYear.updateMany({
        where: {
          schoolId: academicYear.schoolId,
          isCurrent: true,
          NOT: { id },
        },
        data: { isCurrent: false },
      });
    }

    return this.prisma.academicYear.update({
      where: { id },
      data: {
        name: dto.name,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        isCurrent: dto.isCurrent,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        schoolId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true, gradeSections: true },
        },
      },
    });

    if (!academicYear) {
      throw new NotFoundException('Año académico no encontrado');
    }

    // No eliminar si tiene datos asociados
    if (academicYear._count.courses > 0 || academicYear._count.gradeSections > 0) {
      throw new BadRequestException(
        'No se puede eliminar el año académico porque tiene cursos o secciones asociadas',
      );
    }

    await this.prisma.academicYear.delete({ where: { id } });
    return { message: 'Año académico eliminado exitosamente' };
  }

  async setCurrent(id: string) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException('Año académico no encontrado');
    }

    // Desmarcar otros y marcar este
    await this.prisma.academicYear.updateMany({
      where: { schoolId: academicYear.schoolId, isCurrent: true },
      data: { isCurrent: false },
    });

    return this.prisma.academicYear.update({
      where: { id },
      data: { isCurrent: true },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        schoolId: true,
      },
    });
  }
}
