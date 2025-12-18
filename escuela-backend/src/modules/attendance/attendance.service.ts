import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAttendanceDto, UpdateAttendanceDto, MarkAllAttendanceDto } from './dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAttendanceDto) {
    // Verificar que el estudiante existe
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Verificar si ya existe asistencia para este estudiante en esta fecha
    const existing = await this.prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId: dto.studentId,
          date: new Date(dto.date),
        },
      },
    });
    if (existing) {
      throw new ConflictException('Ya existe un registro de asistencia para este estudiante en esta fecha');
    }

    return this.prisma.attendance.create({
      data: {
        date: new Date(dto.date),
        status: dto.status,
        notes: dto.notes,
        studentId: dto.studentId,
        gradeSectionId: dto.gradeSectionId,
        teacherId: dto.teacherId,
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        gradeSection: true,
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  async findAll(gradeSectionId?: string, date?: string, studentId?: string) {
    return this.prisma.attendance.findMany({
      where: {
        ...(gradeSectionId && { gradeSectionId }),
        ...(date && { date: new Date(date) }),
        ...(studentId && { studentId }),
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        gradeSection: true,
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: [{ date: 'desc' }, { student: { user: { lastName: 'asc' } } }],
    });
  }

  async findByCourse(courseId: string, date?: string) {
    // Obtener el gradeSectionId del curso
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { gradeSectionId: true },
    });
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return this.findAll(course.gradeSectionId, date);
  }

  async findByStudent(studentId: string, startDate?: string, endDate?: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return this.prisma.attendance.findMany({
      where: {
        studentId,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        gradeSection: true,
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        gradeSection: true,
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
    if (!attendance) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }
    return attendance;
  }

  async update(id: string, dto: UpdateAttendanceDto) {
    await this.findOne(id);

    return this.prisma.attendance.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        gradeSection: true,
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.attendance.delete({ where: { id } });
    return { message: 'Registro de asistencia eliminado exitosamente' };
  }

  async markAll(dto: MarkAllAttendanceDto) {
    const date = new Date(dto.date);

    // Usar una transacción para garantizar consistencia
    return this.prisma.$transaction(async (tx) => {
      const results = [];

      for (const record of dto.records) {
        // Verificar si ya existe
        const existing = await tx.attendance.findUnique({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date,
            },
          },
        });

        if (existing) {
          // Actualizar existente
          const updated = await tx.attendance.update({
            where: { id: existing.id },
            data: {
              status: record.status,
              notes: record.notes,
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
          });
          results.push(updated);
        } else {
          // Crear nuevo
          const created = await tx.attendance.create({
            data: {
              date,
              status: record.status,
              notes: record.notes,
              studentId: record.studentId,
              gradeSectionId: dto.gradeSectionId,
              teacherId: dto.teacherId,
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
          });
          results.push(created);
        }
      }

      return {
        message: `Se registraron ${results.length} asistencias exitosamente`,
        records: results,
      };
    });
  }

  async getSummary(studentId: string, startDate?: string, endDate?: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const whereClause = {
      studentId,
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    const [total, present, absent, late, excused] = await Promise.all([
      this.prisma.attendance.count({ where: whereClause }),
      this.prisma.attendance.count({ where: { ...whereClause, status: 'PRESENT' } }),
      this.prisma.attendance.count({ where: { ...whereClause, status: 'ABSENT' } }),
      this.prisma.attendance.count({ where: { ...whereClause, status: 'LATE' } }),
      this.prisma.attendance.count({ where: { ...whereClause, status: 'EXCUSED' } }),
    ]);

    const attendanceRate = total > 0 ? ((present + late + excused) / total) * 100 : 0;

    return {
      student: {
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
      },
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      },
      period: startDate && endDate ? { startDate, endDate } : 'all-time',
    };
  }

  async getGradeSectionAttendance(gradeSectionId: string, date: string) {
    // Obtener todos los estudiantes de la sección
    const students = await this.prisma.student.findMany({
      where: { gradeSectionId },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { user: { lastName: 'asc' } },
    });

    // Obtener asistencias registradas para esa fecha
    const attendances = await this.prisma.attendance.findMany({
      where: {
        gradeSectionId,
        date: new Date(date),
      },
    });

    const attendanceMap = new Map(attendances.map(a => [a.studentId, a]));

    return students.map(student => ({
      studentId: student.id,
      name: `${student.user.firstName} ${student.user.lastName}`,
      attendance: attendanceMap.get(student.id) || null,
    }));
  }
}
