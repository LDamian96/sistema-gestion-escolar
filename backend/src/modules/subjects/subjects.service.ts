import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSubjectDto) {
    // Validar duplicado: mismo nombre en mismo grado
    const existing = await this.prisma.subject.findFirst({
      where: {
        gradeLevelId: data.gradeLevelId,
        name: data.name,
      },
    });

    if (existing) {
      throw new BadRequestException(`Ya existe la materia "${data.name}" en este grado`);
    }

    // Validar código duplicado si se proporciona
    if (data.code) {
      const existingCode = await this.prisma.subject.findFirst({
        where: {
          gradeLevelId: data.gradeLevelId,
          code: data.code,
        },
      });

      if (existingCode) {
        throw new BadRequestException(`Ya existe una materia con el código "${data.code}" en este grado`);
      }
    }

    // Crear materia y cursos automáticamente en una transacción
    return this.prisma.$transaction(async (tx) => {
      // Crear la materia
      const subject = await tx.subject.create({
        data,
        include: {
          gradeLevel: {
            include: {
              level: true,
            },
          },
        },
      });

      // Buscar todas las secciones del mismo gradeLevel
      const sections = await tx.section.findMany({
        where: { gradeLevelId: data.gradeLevelId },
        include: {
          classrooms: true,
        },
      });

      // Obtener o crear el año académico activo
      const gradeLevel = await tx.gradeLevel.findUnique({
        where: { id: data.gradeLevelId },
        include: { level: { include: { school: true } } },
      });

      if (gradeLevel?.level?.school) {
        const schoolId = gradeLevel.level.school.id;

        let academicYear = await tx.academicYear.findFirst({
          where: { schoolId, isCurrent: true },
        });

        if (!academicYear) {
          const currentYear = new Date().getFullYear();
          academicYear = await tx.academicYear.create({
            data: {
              schoolId,
              name: `${currentYear}`,
              startDate: new Date(`${currentYear}-03-01`),
              endDate: new Date(`${currentYear}-12-20`),
              isCurrent: true,
            },
          });
        }

        // Crear un curso para cada classroom de cada sección
        const coursesToCreate = [];
        for (const section of sections) {
          for (const classroom of section.classrooms) {
            coursesToCreate.push({
              subjectId: subject.id,
              classroomId: classroom.id,
              academicYearId: academicYear.id,
              // teacherId es opcional, se asignará después
            });
          }
        }

        if (coursesToCreate.length > 0) {
          await tx.course.createMany({
            data: coursesToCreate,
          });
        }
      }

      return subject;
    });
  }

  async findAll(gradeLevelId?: string) {
    return this.prisma.subject.findMany({
      where: { ...(gradeLevelId && { gradeLevelId }) },
      include: {
        gradeLevel: {
          include: {
            level: true,
          },
        },
        _count: {
          select: {
            courses: true,
            curriculum: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        gradeLevel: {
          include: {
            level: true,
          },
        },
        courses: {
          include: {
            teacher: { select: { firstName: true, lastName: true } },
            classroom: true,
          },
        },
        curriculum: {
          include: {
            topics: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Materia no encontrada');
    }

    return subject;
  }

  async update(id: string, data: UpdateSubjectDto) {
    await this.findOne(id);

    const subject = await this.prisma.subject.findUnique({ where: { id } });

    // Si cambia el nombre, validar duplicado
    if (data.name) {
      const existing = await this.prisma.subject.findFirst({
        where: {
          gradeLevelId: subject.gradeLevelId,
          name: data.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestException(`Ya existe la materia "${data.name}" en este grado`);
      }
    }

    // Si cambia el código, validar duplicado
    if (data.code) {
      const existingCode = await this.prisma.subject.findFirst({
        where: {
          gradeLevelId: subject.gradeLevelId,
          code: data.code,
          NOT: { id },
        },
      });

      if (existingCode) {
        throw new BadRequestException(`Ya existe una materia con el código "${data.code}" en este grado`);
      }
    }

    return this.prisma.subject.update({
      where: { id },
      data,
      include: {
        gradeLevel: {
          include: {
            level: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.subject.delete({ where: { id } });
    return { message: 'Materia eliminada' };
  }
}
