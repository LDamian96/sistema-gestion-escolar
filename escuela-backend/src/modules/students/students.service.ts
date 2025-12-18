import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStudentDto, UpdateStudentDto, AssignParentsDto } from './dto';
import { Role, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    // Verificar email único
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar código de estudiante único
    const existingStudent = await this.prisma.student.findUnique({
      where: { studentCode: dto.studentCode },
    });
    if (existingStudent) {
      throw new ConflictException('El código de estudiante ya existe');
    }

    // Crear User + Student en transacción
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
          role: Role.STUDENT,
          schoolId: dto.schoolId,
        },
      });

      // Crear estudiante
      const student = await tx.student.create({
        data: {
          studentCode: dto.studentCode,
          dni: dto.dni,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          gender: dto.gender,
          address: dto.address,
          emergencyPhone: dto.emergencyPhone,
          bloodType: dto.bloodType,
          allergies: dto.allergies,
          medicalNotes: dto.medicalNotes,
          userId: user.id,
          schoolId: dto.schoolId,
          gradeSectionId: dto.gradeSectionId,
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
          gradeSection: {
            select: { id: true, grade: true, section: true, level: true },
          },
        },
      });

      // Asignar padres si se proporcionan
      if (dto.parentIds && dto.parentIds.length > 0) {
        await tx.parentStudent.createMany({
          data: dto.parentIds.map((parentId, index) => ({
            parentId,
            studentId: student.id,
            isPrimary: index === 0,
          })),
        });
      }

      return student;
    });
  }

  async findAll(
    schoolId?: string,
    gradeSectionId?: string,
    search?: string,
    isActive?: boolean,
  ) {
    const where: Record<string, unknown> = {};

    if (schoolId) where.schoolId = schoolId;
    if (gradeSectionId) where.gradeSectionId = gradeSectionId;
    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where.OR = [
        { studentCode: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.student.findMany({
      where,
      select: {
        id: true,
        studentCode: true,
        dni: true,
        birthDate: true,
        gender: true,
        isActive: true,
        enrollmentDate: true,
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
        gradeSection: {
          select: { id: true, grade: true, section: true, level: true },
        },
        _count: {
          select: { parents: true, enrollments: true },
        },
      },
      orderBy: { user: { lastName: 'asc' } },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
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
        gradeSection: {
          select: {
            id: true,
            grade: true,
            section: true,
            level: true,
            academicYear: { select: { id: true, name: true, isCurrent: true } },
          },
        },
        parents: {
          select: {
            isPrimary: true,
            parent: {
              select: {
                id: true,
                relationship: true,
                user: {
                  select: { firstName: true, lastName: true, phone: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return student;
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Verificar código único si cambia
    if (dto.studentCode && dto.studentCode !== student.studentCode) {
      const existing = await this.prisma.student.findUnique({
        where: { studentCode: dto.studentCode },
      });
      if (existing) {
        throw new ConflictException('El código de estudiante ya existe');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Actualizar usuario
      if (dto.firstName || dto.lastName || dto.phone) {
        await tx.user.update({
          where: { id: student.userId },
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
          },
        });
      }

      // Actualizar estudiante
      const updatedStudent = await tx.student.update({
        where: { id },
        data: {
          studentCode: dto.studentCode,
          dni: dto.dni,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          gender: dto.gender,
          address: dto.address,
          emergencyPhone: dto.emergencyPhone,
          bloodType: dto.bloodType,
          allergies: dto.allergies,
          medicalNotes: dto.medicalNotes,
          gradeSectionId: dto.gradeSectionId,
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
          gradeSection: {
            select: { id: true, grade: true, section: true, level: true },
          },
        },
      });

      // Actualizar estado del usuario si cambia isActive
      if (dto.isActive !== undefined) {
        await tx.user.update({
          where: { id: student.userId },
          data: { isActive: dto.isActive },
        });
      }

      return updatedStudent;
    });
  }

  async remove(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true, attendances: true, grades: true },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Soft delete si tiene datos
    const hasData =
      student._count.enrollments > 0 ||
      student._count.attendances > 0 ||
      student._count.grades > 0;

    if (hasData) {
      await this.prisma.$transaction([
        this.prisma.student.update({
          where: { id },
          data: { isActive: false },
        }),
        this.prisma.user.update({
          where: { id: student.userId },
          data: { isActive: false },
        }),
      ]);
      return { message: 'Estudiante desactivado (tiene registros asociados)' };
    }

    // Hard delete
    await this.prisma.$transaction([
      this.prisma.parentStudent.deleteMany({ where: { studentId: id } }),
      this.prisma.student.delete({ where: { id } }),
      this.prisma.user.delete({ where: { id: student.userId } }),
    ]);

    return { message: 'Estudiante eliminado exitosamente' };
  }

  async assignParents(studentId: string, dto: AssignParentsDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Verificar que todos los padres existen
    const parentIds = dto.parents.map((p) => p.parentId);
    const parents = await this.prisma.parent.findMany({
      where: { id: { in: parentIds } },
    });

    if (parents.length !== parentIds.length) {
      throw new BadRequestException('Uno o más padres no existen');
    }

    // Eliminar asignaciones anteriores y crear nuevas
    await this.prisma.$transaction([
      this.prisma.parentStudent.deleteMany({
        where: { studentId },
      }),
      this.prisma.parentStudent.createMany({
        data: dto.parents.map((p) => ({
          parentId: p.parentId,
          studentId,
          isPrimary: p.isPrimary || false,
        })),
      }),
    ]);

    return this.findOne(studentId);
  }

  async getParents(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return this.prisma.parentStudent.findMany({
      where: { studentId },
      select: {
        isPrimary: true,
        createdAt: true,
        parent: {
          select: {
            id: true,
            relationship: true,
            occupation: true,
            workPhone: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  async getEnrollments(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return this.prisma.enrollment.findMany({
      where: { studentId, isActive: true },
      select: {
        id: true,
        enrolledAt: true,
        course: {
          select: {
            id: true,
            name: true,
            subject: { select: { name: true, code: true } },
            teacher: {
              select: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
  }

  async assignToSection(studentId: string, gradeSectionId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const gradeSection = await this.prisma.gradeSection.findUnique({
      where: { id: gradeSectionId },
    });

    if (!gradeSection) {
      throw new NotFoundException('Sección no encontrada');
    }

    return this.prisma.student.update({
      where: { id: studentId },
      data: { gradeSectionId },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
        gradeSection: {
          select: { grade: true, section: true, level: true },
        },
      },
    });
  }
}
