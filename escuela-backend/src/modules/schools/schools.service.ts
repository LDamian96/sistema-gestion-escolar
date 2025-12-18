import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSchoolDto, UpdateSchoolDto } from './dto';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSchoolDto) {
    // Verificar código único
    const existing = await this.prisma.school.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException('El código de escuela ya existe');
    }

    return this.prisma.school.create({
      data: dto,
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        logo: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findAll(search?: string, isActive?: boolean) {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.school.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        logo: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            students: true,
            teachers: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        logo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            students: true,
            teachers: true,
            parents: true,
            academicYears: true,
            gradeSections: true,
            subjects: true,
          },
        },
      },
    });

    if (!school) {
      throw new NotFoundException('Escuela no encontrada');
    }

    return school;
  }

  async update(id: string, dto: UpdateSchoolDto) {
    const school = await this.prisma.school.findUnique({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException('Escuela no encontrada');
    }

    // Verificar código único si se está cambiando
    if (dto.code && dto.code !== school.code) {
      const existing = await this.prisma.school.findUnique({
        where: { code: dto.code },
      });

      if (existing) {
        throw new ConflictException('El código de escuela ya existe');
      }
    }

    return this.prisma.school.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        logo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!school) {
      throw new NotFoundException('Escuela no encontrada');
    }

    // No eliminar si tiene usuarios
    if (school._count.users > 0) {
      // Soft delete
      await this.prisma.school.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Escuela desactivada (tiene usuarios asociados)' };
    }

    await this.prisma.school.delete({ where: { id } });
    return { message: 'Escuela eliminada exitosamente' };
  }

  async getStats(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException('Escuela no encontrada');
    }

    const [users, students, teachers, parents, academicYears, gradeSections, subjects] =
      await Promise.all([
        this.prisma.user.count({ where: { schoolId: id } }),
        this.prisma.student.count({ where: { schoolId: id, isActive: true } }),
        this.prisma.teacher.count({ where: { schoolId: id, isActive: true } }),
        this.prisma.parent.count({ where: { schoolId: id, isActive: true } }),
        this.prisma.academicYear.count({ where: { schoolId: id } }),
        this.prisma.gradeSection.count({ where: { schoolId: id, isActive: true } }),
        this.prisma.subject.count({ where: { schoolId: id, isActive: true } }),
      ]);

    return {
      schoolId: id,
      schoolName: school.name,
      counts: {
        users,
        students,
        teachers,
        parents,
        academicYears,
        gradeSections,
        subjects,
      },
    };
  }
}
