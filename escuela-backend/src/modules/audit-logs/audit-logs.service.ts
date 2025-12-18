import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAuditLogDto, QueryAuditLogDto } from './dto';
import { AuditAction, Prisma } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        action: dto.action,
        resource: dto.resource,
        resourceId: dto.resourceId,
        oldData: dto.oldData as Prisma.InputJsonValue,
        newData: dto.newData as Prisma.InputJsonValue,
        ip: dto.ip,
        userAgent: dto.userAgent,
        duration: dto.duration,
        success: dto.success ?? true,
        errorMessage: dto.errorMessage,
        userId: dto.userId,
        schoolId: dto.schoolId,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  // Método helper para registrar acciones fácilmente desde otros servicios
  async log(
    action: AuditAction,
    resource: string,
    schoolId: string,
    options?: {
      resourceId?: string;
      userId?: string;
      oldData?: Record<string, unknown>;
      newData?: Record<string, unknown>;
      ip?: string;
      userAgent?: string;
      duration?: number;
      success?: boolean;
      errorMessage?: string;
    },
  ) {
    return this.prisma.auditLog.create({
      data: {
        action,
        resource,
        schoolId,
        resourceId: options?.resourceId,
        userId: options?.userId,
        oldData: options?.oldData as Prisma.InputJsonValue,
        newData: options?.newData as Prisma.InputJsonValue,
        ip: options?.ip,
        userAgent: options?.userAgent,
        duration: options?.duration,
        success: options?.success ?? true,
        errorMessage: options?.errorMessage,
      },
    });
  }

  async findAll(query: QueryAuditLogDto) {
    const {
      action,
      resource,
      resourceId,
      userId,
      schoolId,
      startDate,
      endDate,
      success,
      page = 1,
      limit = 50,
    } = query;

    const where: Prisma.AuditLogWhereInput = {
      ...(action && { action }),
      ...(resource && { resource }),
      ...(resourceId && { resourceId }),
      ...(userId && { userId }),
      ...(schoolId && { schoolId }),
      ...(success !== undefined && { success: success === 'true' }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
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

  async findOne(id: string) {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, role: true },
        },
        school: {
          select: { name: true },
        },
      },
    });

    if (!auditLog) {
      throw new NotFoundException('Registro de auditoría no encontrado');
    }

    return auditLog;
  }

  async findByResource(resource: string, resourceId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStats(schoolId: string, startDate?: string, endDate?: string) {
    const dateFilter = {
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [
      totalLogs,
      byAction,
      byResource,
      failedOperations,
      recentActivity,
    ] = await Promise.all([
      // Total de registros
      this.prisma.auditLog.count({
        where: { schoolId, ...dateFilter },
      }),

      // Por tipo de acción
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { schoolId, ...dateFilter },
        _count: { action: true },
      }),

      // Por recurso
      this.prisma.auditLog.groupBy({
        by: ['resource'],
        where: { schoolId, ...dateFilter },
        _count: { resource: true },
        orderBy: { _count: { resource: 'desc' } },
        take: 10,
      }),

      // Operaciones fallidas
      this.prisma.auditLog.count({
        where: { schoolId, success: false, ...dateFilter },
      }),

      // Actividad reciente (últimas 24 horas)
      this.prisma.auditLog.count({
        where: {
          schoolId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      totalLogs,
      failedOperations,
      successRate: totalLogs > 0 ? ((totalLogs - failedOperations) / totalLogs * 100).toFixed(2) + '%' : '100%',
      recentActivity,
      byAction: byAction.map((a) => ({
        action: a.action,
        count: a._count.action,
      })),
      byResource: byResource.map((r) => ({
        resource: r.resource,
        count: r._count.resource,
      })),
    };
  }

  async deleteOldLogs(daysOld: number = 90) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysOld);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: dateThreshold },
      },
    });

    return {
      message: `Se eliminaron ${result.count} registros de auditoría antiguos`,
      count: result.count,
    };
  }

  async getLoginHistory(schoolId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: {
        schoolId,
        action: { in: [AuditAction.LOGIN, AuditAction.LOGOUT] },
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
