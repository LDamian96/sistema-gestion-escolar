import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClassroomDto, UpdateClassroomDto } from './dto/create-classroom.dto';

@Injectable()
export class ClassroomsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateClassroomDto) {
    // Validar que la sección existe
    const section = await this.prisma.section.findUnique({
      where: { id: data.sectionId },
    });

    if (!section) {
      throw new BadRequestException('La sección no existe');
    }

    // Validar duplicado: mismo nombre en misma sección
    const existing = await this.prisma.classroom.findFirst({
      where: {
        sectionId: data.sectionId,
        name: data.name,
      },
    });

    if (existing) {
      throw new BadRequestException(`Ya existe un aula "${data.name}" en esta sección`);
    }

    return this.prisma.classroom.create({
      data,
      include: {
        section: {
          include: {
            gradeLevel: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            courses: true,
          },
        },
      },
    });
  }

  async findAll(sectionId?: string) {
    return this.prisma.classroom.findMany({
      where: { ...(sectionId && { sectionId }) },
      include: {
        section: {
          include: {
            gradeLevel: {
              include: {
                level: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            courses: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            gradeLevel: true,
          },
        },
        courses: {
          include: {
            subject: true,
            teacher: true,
          },
        },
        enrollments: {
          include: {
            student: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            courses: true,
          },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException('Aula no encontrada');
    }

    return classroom;
  }

  async update(id: string, data: UpdateClassroomDto) {
    await this.findOne(id);

    // Si cambia el nombre, validar duplicado
    if (data.name) {
      const classroom = await this.prisma.classroom.findUnique({ where: { id } });
      const existing = await this.prisma.classroom.findFirst({
        where: {
          sectionId: data.sectionId || classroom.sectionId,
          name: data.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestException(`Ya existe un aula "${data.name}" en esta sección`);
      }
    }

    return this.prisma.classroom.update({
      where: { id },
      data,
      include: {
        section: {
          include: {
            gradeLevel: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            courses: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const classroom = await this.findOne(id);

    // Verificar si tiene cursos o matrículas asociadas
    if (classroom._count.enrollments > 0 || classroom._count.courses > 0) {
      throw new BadRequestException('No se puede eliminar un aula con matrículas o cursos asociados');
    }

    await this.prisma.classroom.delete({ where: { id } });
    return { message: 'Aula eliminada' };
  }
}
