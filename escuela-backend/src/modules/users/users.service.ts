import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto, creatorRole: Role) {
    // Solo ADMIN puede crear usuarios
    if (creatorRole !== Role.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden crear usuarios');
    }

    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        schoolId: true,
        createdAt: true,
      },
    });

    return user;
  }

  async findAll(query: QueryUsersDto, requestorSchoolId: string, requestorRole: Role) {
    const {
      search,
      role,
      isActive,
      schoolId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Construir filtros
    const where: any = {};

    // Los no-admin solo ven usuarios de su propia escuela
    if (requestorRole !== Role.ADMIN) {
      where.schoolId = requestorSchoolId;
    } else if (schoolId) {
      where.schoolId = schoolId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Contar total de registros
    const total = await this.prisma.user.count({ where });

    // Obtener usuarios paginados
    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        schoolId: true,
        createdAt: true,
        updatedAt: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string, requestorSchoolId: string, requestorRole: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        schoolId: true,
        createdAt: true,
        updatedAt: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar acceso: solo ADMIN puede ver usuarios de otras escuelas
    if (requestorRole !== Role.ADMIN && user.schoolId !== requestorSchoolId) {
      throw new ForbiddenException('No tiene permiso para ver este usuario');
    }

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    requestorId: string,
    requestorSchoolId: string,
    requestorRole: Role,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar permisos
    const isSelf = id === requestorId;
    const isAdmin = requestorRole === Role.ADMIN;
    const isSameSchool = user.schoolId === requestorSchoolId;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('No tiene permiso para actualizar este usuario');
    }

    if (!isAdmin && !isSameSchool) {
      throw new ForbiddenException('No tiene permiso para actualizar usuarios de otra escuela');
    }

    // Solo ADMIN puede cambiar roles
    if (dto.role && !isAdmin) {
      throw new ForbiddenException('Solo los administradores pueden cambiar roles');
    }

    // Verificar email único si se está cambiando
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        schoolId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async remove(id: string, requestorRole: Role) {
    // Solo ADMIN puede eliminar usuarios
    if (requestorRole !== Role.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden eliminar usuarios');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Soft delete - desactivar en lugar de eliminar
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Usuario desactivado exitosamente' };
  }

  async activate(id: string, requestorRole: Role) {
    if (requestorRole !== Role.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden activar usuarios');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return { message: 'Usuario activado exitosamente' };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getStats(schoolId?: string) {
    const where = schoolId ? { schoolId } : {};

    const [total, byRole, active, inactive] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.groupBy({
        by: ['role'],
        where,
        _count: { role: true },
      }),
      this.prisma.user.count({ where: { ...where, isActive: true } }),
      this.prisma.user.count({ where: { ...where, isActive: false } }),
    ]);

    const roleStats = byRole.reduce<Record<string, number>>(
      (acc: Record<string, number>, item: { role: string; _count: { role: number } }) => {
        acc[item.role] = item._count.role;
        return acc;
      },
      {},
    );

    return {
      total,
      active,
      inactive,
      byRole: roleStats,
    };
  }
}
