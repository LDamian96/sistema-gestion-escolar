import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTeacherDto, UpdateTeacherDto } from './dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTeacherDto) {
    // Verificar email único
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar código de profesor único
    const existingTeacher = await this.prisma.teacher.findUnique({
      where: { teacherCode: dto.teacherCode },
    });
    if (existingTeacher) {
      throw new ConflictException('El código de profesor ya existe');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          role: Role.TEACHER,
          schoolId: dto.schoolId,
        },
      });

      // Crear profesor
      const teacher = await tx.teacher.create({
        data: {
          teacherCode: dto.teacherCode,
          dni: dto.dni,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          gender: dto.gender,
          address: dto.address,
          phone: dto.phone,
          specialties: dto.specialties || [],
          userId: user.id,
          schoolId: dto.schoolId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      });

      return teacher;
    });
  }

  async findAll(schoolId?: string, search?: string, isActive?: boolean) {
    const where: Record<string, unknown> = {};

    if (schoolId) where.schoolId = schoolId;
    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where.OR = [
        { teacherCode: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.teacher.findMany({
      where,
      select: {
        id: true,
        teacherCode: true,
        dni: true,
        specialties: true,
        hireDate: true,
        isActive: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          },
        },
        _count: {
          select: { courses: true, tasks: true, exams: true },
        },
      },
      orderBy: { user: { lastName: 'asc' } },
    });
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        school: {
          select: { id: true, name: true },
        },
        courses: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            subject: { select: { name: true, code: true } },
            gradeSection: {
              select: { grade: true, section: true, level: true },
            },
            academicYear: { select: { name: true, isCurrent: true } },
          },
        },
        _count: {
          select: { courses: true, tasks: true, exams: true },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }

    return teacher;
  }

  async update(id: string, dto: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }

    // Verificar código único si cambia
    if (dto.teacherCode && dto.teacherCode !== teacher.teacherCode) {
      const existing = await this.prisma.teacher.findUnique({
        where: { teacherCode: dto.teacherCode },
      });
      if (existing) {
        throw new ConflictException('El código de profesor ya existe');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Actualizar usuario
      if (dto.firstName || dto.lastName || dto.phone) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
          },
        });
      }

      // Actualizar profesor
      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: {
          teacherCode: dto.teacherCode,
          dni: dto.dni,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          gender: dto.gender,
          address: dto.address,
          phone: dto.phone,
          specialties: dto.specialties,
          isActive: dto.isActive,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      });

      // Actualizar estado del usuario si cambia isActive
      if (dto.isActive !== undefined) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: { isActive: dto.isActive },
        });
      }

      return updatedTeacher;
    });
  }

  async remove(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true, tasks: true, exams: true },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }

    // Soft delete si tiene datos
    const hasData =
      teacher._count.courses > 0 ||
      teacher._count.tasks > 0 ||
      teacher._count.exams > 0;

    if (hasData) {
      await this.prisma.$transaction([
        this.prisma.teacher.update({
          where: { id },
          data: { isActive: false },
        }),
        this.prisma.user.update({
          where: { id: teacher.userId },
          data: { isActive: false },
        }),
      ]);
      return { message: 'Profesor desactivado (tiene registros asociados)' };
    }

    // Hard delete
    await this.prisma.$transaction([
      this.prisma.teacher.delete({ where: { id } }),
      this.prisma.user.delete({ where: { id: teacher.userId } }),
    ]);

    return { message: 'Profesor eliminado exitosamente' };
  }

  async getCourses(teacherId: string, academicYearId?: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Profesor no encontrado');
    }

    const where: Record<string, unknown> = {
      teacherId,
      isActive: true,
    };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    return this.prisma.course.findMany({
      where,
      select: {
        id: true,
        name: true,
        hoursPerWeek: true,
        subject: { select: { id: true, name: true, code: true, color: true } },
        gradeSection: {
          select: { id: true, grade: true, section: true, level: true },
        },
        academicYear: { select: { id: true, name: true, isCurrent: true } },
        _count: {
          select: { enrollments: true, tasks: true, exams: true },
        },
      },
    });
  }
}
