import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateGradeDto, UpdateGradeDto } from './dto';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGradeDto) {
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

    return this.prisma.grade.create({
      data: {
        value: dto.value,
        letter: dto.letter || this.calculateLetter(dto.value),
        period: dto.period,
        type: dto.type,
        comment: dto.comment,
        studentId: dto.studentId,
        courseId: dto.courseId,
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        course: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  async findAll(courseId?: string, studentId?: string, period?: number, type?: string) {
    return this.prisma.grade.findMany({
      where: {
        ...(courseId && { courseId }),
        ...(studentId && { studentId }),
        ...(period && { period }),
        ...(type && { type }),
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        course: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: [{ period: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const grade = await this.prisma.grade.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        course: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    });
    if (!grade) {
      throw new NotFoundException('Calificación no encontrada');
    }
    return grade;
  }

  async update(id: string, dto: UpdateGradeDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {};
    if (dto.value !== undefined) {
      updateData.value = dto.value;
      updateData.letter = dto.letter || this.calculateLetter(dto.value);
    }
    if (dto.letter !== undefined && dto.value === undefined) {
      updateData.letter = dto.letter;
    }
    if (dto.period !== undefined) updateData.period = dto.period;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.comment !== undefined) updateData.comment = dto.comment;

    return this.prisma.grade.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        course: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.grade.delete({ where: { id } });
    return { message: 'Calificación eliminada exitosamente' };
  }

  async findByStudent(studentId: string, courseId?: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return this.prisma.grade.findMany({
      where: {
        studentId,
        ...(courseId && { courseId }),
      },
      include: {
        course: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: [{ course: { subject: { name: 'asc' } } }, { period: 'asc' }],
    });
  }

  async findByCourse(courseId: string, period?: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return this.prisma.grade.findMany({
      where: {
        courseId,
        ...(period && { period }),
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: [{ student: { user: { lastName: 'asc' } } }, { period: 'asc' }],
    });
  }

  async getStudentReport(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
        gradeSection: true,
      },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const grades = await this.prisma.grade.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            subject: true,
          },
        },
      },
    });

    // Agrupar por curso
    const courseMap = new Map<string, { course: { id: string; subject: { name: string } }; grades: typeof grades }>();
    for (const grade of grades) {
      const courseId = grade.courseId;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, { course: grade.course, grades: [] });
      }
      courseMap.get(courseId)!.grades.push(grade);
    }

    // Calcular promedios por curso y período
    const report = Array.from(courseMap.values()).map(({ course, grades: courseGrades }) => {
      const periodAverages: Record<number, number> = {};

      for (let p = 1; p <= 4; p++) {
        const periodGrades = courseGrades.filter(g => g.period === p);
        if (periodGrades.length > 0) {
          periodAverages[p] = periodGrades.reduce((sum, g) => sum + g.value, 0) / periodGrades.length;
        }
      }

      const allValues = courseGrades.map(g => g.value);
      const average = allValues.length > 0 ? allValues.reduce((sum, v) => sum + v, 0) / allValues.length : 0;

      return {
        courseId: course.id,
        subject: course.subject.name,
        periodAverages,
        average: Math.round(average * 100) / 100,
        letterGrade: this.calculateLetter(average),
        totalGrades: courseGrades.length,
      };
    });

    // Promedio general
    const allGrades = grades.map(g => g.value);
    const overallAverage = allGrades.length > 0 ? allGrades.reduce((sum, v) => sum + v, 0) / allGrades.length : 0;

    return {
      student: {
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        gradeSection: student.gradeSection,
      },
      courses: report,
      overallAverage: Math.round(overallAverage * 100) / 100,
      overallLetter: this.calculateLetter(overallAverage),
    };
  }

  async getCourseStats(courseId: string, period?: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subject: true,
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const grades = await this.prisma.grade.findMany({
      where: {
        courseId,
        ...(period && { period }),
      },
    });

    if (grades.length === 0) {
      return {
        course: {
          id: course.id,
          subject: course.subject.name,
          teacher: course.teacher ? `${course.teacher.user.firstName} ${course.teacher.user.lastName}` : null,
        },
        period: period || 'all',
        stats: null,
        message: 'No hay calificaciones registradas',
      };
    }

    const values = grades.map(g => g.value);
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Calcular distribución por letra
    const distribution = {
      AD: grades.filter(g => g.value >= 18).length,
      A: grades.filter(g => g.value >= 14 && g.value < 18).length,
      B: grades.filter(g => g.value >= 11 && g.value < 14).length,
      C: grades.filter(g => g.value < 11).length,
    };

    // Tasa de aprobación (>=11)
    const passed = grades.filter(g => g.value >= 11).length;
    const passRate = (passed / grades.length) * 100;

    return {
      course: {
        id: course.id,
        subject: course.subject.name,
        teacher: course.teacher ? `${course.teacher.user.firstName} ${course.teacher.user.lastName}` : null,
      },
      period: period || 'all',
      stats: {
        totalGrades: grades.length,
        average: Math.round(average * 100) / 100,
        max,
        min,
        passRate: Math.round(passRate * 100) / 100,
        distribution,
      },
    };
  }

  private calculateLetter(value: number): string {
    if (value >= 18) return 'AD';
    if (value >= 14) return 'A';
    if (value >= 11) return 'B';
    return 'C';
  }
}
