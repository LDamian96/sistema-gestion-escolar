import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCourseDto, UpdateCourseDto, EnrollStudentsDto } from './dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCourseDto) {
    // Verificar que no existe el mismo curso (sección + materia + año)
    const existing = await this.prisma.course.findUnique({
      where: {
        gradeSectionId_subjectId_academicYearId: {
          gradeSectionId: dto.gradeSectionId,
          subjectId: dto.subjectId,
          academicYearId: dto.academicYearId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe un curso con esta materia en esta sección para el año académico');
    }

    // Verificar que el profesor existe
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: dto.teacherId },
    });
    if (!teacher) {
      throw new BadRequestException('El profesor no existe');
    }

    return this.prisma.course.create({
      data: {
        name: dto.name,
        description: dto.description,
        hoursPerWeek: dto.hoursPerWeek || 2,
        gradeScale: dto.gradeScale,
        teacherId: dto.teacherId,
        gradeSectionId: dto.gradeSectionId,
        subjectId: dto.subjectId,
        academicYearId: dto.academicYearId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        subject: { select: { id: true, name: true, code: true, color: true } },
        gradeSection: { select: { id: true, grade: true, section: true, level: true } },
        academicYear: { select: { id: true, name: true, isCurrent: true } },
      },
    });
  }

  async findAll(
    gradeSectionId?: string,
    teacherId?: string,
    subjectId?: string,
    academicYearId?: string,
    isActive?: boolean,
  ) {
    const where: Record<string, unknown> = {};

    if (gradeSectionId) where.gradeSectionId = gradeSectionId;
    if (teacherId) where.teacherId = teacherId;
    if (subjectId) where.subjectId = subjectId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (isActive !== undefined) where.isActive = isActive;

    return this.prisma.course.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        hoursPerWeek: true,
        gradeScale: true,
        isActive: true,
        teacher: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        subject: { select: { id: true, name: true, code: true, color: true } },
        gradeSection: { select: { id: true, grade: true, section: true, level: true } },
        academicYear: { select: { id: true, name: true, isCurrent: true } },
        _count: {
          select: { enrollments: true, tasks: true, exams: true },
        },
      },
      orderBy: [
        { gradeSection: { grade: 'asc' } },
        { subject: { name: 'asc' } },
      ],
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            teacherCode: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        subject: { select: { id: true, name: true, code: true, color: true, description: true } },
        gradeSection: {
          select: {
            id: true,
            grade: true,
            section: true,
            level: true,
            classroom: true,
            school: { select: { id: true, name: true } },
          },
        },
        academicYear: { select: { id: true, name: true, isCurrent: true, startDate: true, endDate: true } },
        _count: {
          select: { enrollments: true, tasks: true, exams: true, grades: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return course;
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar profesor si cambia
    if (dto.teacherId && dto.teacherId !== course.teacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: dto.teacherId },
      });
      if (!teacher) {
        throw new BadRequestException('El profesor no existe');
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        hoursPerWeek: dto.hoursPerWeek,
        gradeScale: dto.gradeScale,
        teacherId: dto.teacherId,
        isActive: dto.isActive,
      },
      include: {
        teacher: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        subject: { select: { id: true, name: true, code: true } },
        gradeSection: { select: { id: true, grade: true, section: true, level: true } },
        academicYear: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true, tasks: true, exams: true, grades: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const hasData =
      course._count.enrollments > 0 ||
      course._count.tasks > 0 ||
      course._count.exams > 0 ||
      course._count.grades > 0;

    if (hasData) {
      await this.prisma.course.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Curso desactivado (tiene registros asociados)' };
    }

    await this.prisma.course.delete({ where: { id } });
    return { message: 'Curso eliminado exitosamente' };
  }

  async getEnrolledStudents(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return this.prisma.enrollment.findMany({
      where: { courseId, isActive: true },
      select: {
        id: true,
        enrolledAt: true,
        student: {
          select: {
            id: true,
            studentCode: true,
            user: {
              select: { firstName: true, lastName: true, email: true, avatar: true },
            },
          },
        },
      },
      orderBy: { student: { user: { lastName: 'asc' } } },
    });
  }

  async enrollStudents(courseId: string, dto: EnrollStudentsDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar que todos los estudiantes existen
    const students = await this.prisma.student.findMany({
      where: { id: { in: dto.studentIds }, isActive: true },
    });

    if (students.length !== dto.studentIds.length) {
      throw new BadRequestException('Uno o más estudiantes no existen o no están activos');
    }

    // Crear enrollments, ignorando duplicados
    const enrollments = await this.prisma.$transaction(
      dto.studentIds.map((studentId) =>
        this.prisma.enrollment.upsert({
          where: {
            studentId_courseId: { studentId, courseId },
          },
          create: {
            studentId,
            courseId,
            isActive: true,
          },
          update: {
            isActive: true,
          },
        }),
      ),
    );

    return {
      message: `${enrollments.length} estudiante(s) matriculado(s)`,
      enrollments: enrollments.length,
    };
  }

  async unenrollStudent(courseId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('El estudiante no está matriculado en este curso');
    }

    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { isActive: false },
    });

    return { message: 'Estudiante desmatriculado del curso' };
  }

  async enrollSectionStudents(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { gradeSection: true },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Obtener todos los estudiantes de la sección
    const students = await this.prisma.student.findMany({
      where: {
        gradeSectionId: course.gradeSectionId,
        isActive: true,
      },
      select: { id: true },
    });

    if (students.length === 0) {
      return { message: 'No hay estudiantes en esta sección', enrollments: 0 };
    }

    // Matricular todos
    const enrollments = await this.prisma.$transaction(
      students.map((student) =>
        this.prisma.enrollment.upsert({
          where: {
            studentId_courseId: { studentId: student.id, courseId },
          },
          create: {
            studentId: student.id,
            courseId,
            isActive: true,
          },
          update: {
            isActive: true,
          },
        }),
      ),
    );

    return {
      message: `${enrollments.length} estudiante(s) de la sección matriculado(s)`,
      enrollments: enrollments.length,
    };
  }
}
