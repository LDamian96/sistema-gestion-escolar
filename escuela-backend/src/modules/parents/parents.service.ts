import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateParentDto, UpdateParentDto, AssignChildrenDto } from './dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateParentDto) {
    // Verificar email único
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
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
          role: Role.PARENT,
          schoolId: dto.schoolId,
        },
      });

      // Crear padre
      const parent = await tx.parent.create({
        data: {
          dni: dto.dni,
          occupation: dto.occupation,
          workPhone: dto.workPhone,
          workAddress: dto.workAddress,
          relationship: dto.relationship,
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

      // Asignar hijos si se proporcionan
      if (dto.studentIds && dto.studentIds.length > 0) {
        await tx.parentStudent.createMany({
          data: dto.studentIds.map((studentId, index) => ({
            parentId: parent.id,
            studentId,
            isPrimary: index === 0,
          })),
        });
      }

      return parent;
    });
  }

  async findAll(schoolId?: string, search?: string, isActive?: boolean) {
    const where: Record<string, unknown> = {};

    if (schoolId) where.schoolId = schoolId;
    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where.OR = [
        { dni: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.parent.findMany({
      where,
      select: {
        id: true,
        dni: true,
        occupation: true,
        relationship: true,
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
          select: { children: true },
        },
      },
      orderBy: { user: { lastName: 'asc' } },
    });
  }

  async findOne(id: string) {
    const parent = await this.prisma.parent.findUnique({
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
        children: {
          select: {
            isPrimary: true,
            student: {
              select: {
                id: true,
                studentCode: true,
                user: {
                  select: { firstName: true, lastName: true },
                },
                gradeSection: {
                  select: { grade: true, section: true, level: true },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Padre/Tutor no encontrado');
    }

    return parent;
  }

  async update(id: string, dto: UpdateParentDto) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!parent) {
      throw new NotFoundException('Padre/Tutor no encontrado');
    }

    return this.prisma.$transaction(async (tx) => {
      // Actualizar usuario
      if (dto.firstName || dto.lastName || dto.phone) {
        await tx.user.update({
          where: { id: parent.userId },
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
          },
        });
      }

      // Actualizar padre
      const updatedParent = await tx.parent.update({
        where: { id },
        data: {
          dni: dto.dni,
          occupation: dto.occupation,
          workPhone: dto.workPhone,
          workAddress: dto.workAddress,
          relationship: dto.relationship,
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
          where: { id: parent.userId },
          data: { isActive: dto.isActive },
        });
      }

      return updatedParent;
    });
  }

  async remove(id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: {
        _count: {
          select: { children: true },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Padre/Tutor no encontrado');
    }

    // Soft delete si tiene hijos asignados
    if (parent._count.children > 0) {
      await this.prisma.$transaction([
        this.prisma.parent.update({
          where: { id },
          data: { isActive: false },
        }),
        this.prisma.user.update({
          where: { id: parent.userId },
          data: { isActive: false },
        }),
      ]);
      return { message: 'Padre/Tutor desactivado (tiene hijos asignados)' };
    }

    // Hard delete
    await this.prisma.$transaction([
      this.prisma.parent.delete({ where: { id } }),
      this.prisma.user.delete({ where: { id: parent.userId } }),
    ]);

    return { message: 'Padre/Tutor eliminado exitosamente' };
  }

  async assignChildren(parentId: string, dto: AssignChildrenDto) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Padre/Tutor no encontrado');
    }

    // Verificar que todos los estudiantes existen
    const studentIds = dto.children.map((c) => c.studentId);
    const students = await this.prisma.student.findMany({
      where: { id: { in: studentIds } },
    });

    if (students.length !== studentIds.length) {
      throw new BadRequestException('Uno o más estudiantes no existen');
    }

    // Eliminar asignaciones anteriores y crear nuevas
    await this.prisma.$transaction([
      this.prisma.parentStudent.deleteMany({
        where: { parentId },
      }),
      this.prisma.parentStudent.createMany({
        data: dto.children.map((c) => ({
          parentId,
          studentId: c.studentId,
          isPrimary: c.isPrimary || false,
        })),
      }),
    ]);

    return this.findOne(parentId);
  }

  async getChildren(parentId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Padre/Tutor no encontrado');
    }

    return this.prisma.parentStudent.findMany({
      where: { parentId },
      select: {
        isPrimary: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            studentCode: true,
            birthDate: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
            gradeSection: {
              select: {
                grade: true,
                section: true,
                level: true,
                academicYear: { select: { name: true } },
              },
            },
          },
        },
      },
    });
  }
}
