import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEnrollmentDto } from './dto';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEnrollmentDto) {
    // Verificar que el estudiante existe
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Verificar que el curso existe
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar que no esté ya matriculado
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: dto.studentId,
          courseId: dto.courseId,
        },
      },
    });

    if (existing && existing.isActive) {
      throw new ConflictException('El estudiante ya está matriculado en este curso');
    }

    // Si existe pero inactivo, reactivar
    if (existing) {
      return this.prisma.enrollment.update({
        where: { id: existing.id },
        data: { isActive: true, enrolledAt: new Date() },
        include: {
          student: {
            select: {
              studentCode: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
          course: {
            select: { name: true, subject: { select: { name: true } } },
          },
        },
      });
    }

    return this.prisma.enrollment.create({
      data: {
        studentId: dto.studentId,
        courseId: dto.courseId,
      },
      include: {
        student: {
          select: {
            studentCode: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        course: {
          select: { name: true, subject: { select: { name: true } } },
        },
      },
    });
  }

  async findAll(studentId?: string, courseId?: string, isActive?: boolean) {
    const where: Record<string, unknown> = {};

    if (studentId) where.studentId = studentId;
    if (courseId) where.courseId = courseId;
    if (isActive !== undefined) where.isActive = isActive;

    return this.prisma.enrollment.findMany({
      where,
      select: {
        id: true,
        enrolledAt: true,
        isActive: true,
        student: {
          select: {
            id: true,
            studentCode: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            subject: { select: { name: true, code: true } },
            gradeSection: { select: { grade: true, section: true, level: true } },
            academicYear: { select: { name: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            studentCode: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            subject: { select: { name: true, code: true } },
            teacher: {
              select: { user: { select: { firstName: true, lastName: true } } },
            },
            gradeSection: { select: { grade: true, section: true, level: true } },
            academicYear: { select: { name: true, isCurrent: true } },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    return enrollment;
  }

  async remove(id: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    await this.prisma.enrollment.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Matrícula desactivada' };
  }

  async getStudentEnrollments(studentId: string, academicYearId?: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const where: Record<string, unknown> = {
      studentId,
      isActive: true,
    };

    if (academicYearId) {
      where.course = { academicYearId };
    }

    return this.prisma.enrollment.findMany({
      where,
      select: {
        id: true,
        enrolledAt: true,
        course: {
          select: {
            id: true,
            name: true,
            hoursPerWeek: true,
            subject: { select: { name: true, code: true, color: true } },
            teacher: {
              select: { user: { select: { firstName: true, lastName: true } } },
            },
            gradeSection: { select: { grade: true, section: true } },
            academicYear: { select: { name: true, isCurrent: true } },
          },
        },
      },
    });
  }
}
