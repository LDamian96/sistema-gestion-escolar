import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateGroupDto, UpdateGroupDto, QueryGroupsDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGroupDto) {
    // Verificar que la escuela existe
    const school = await this.prisma.school.findUnique({
      where: { id: dto.schoolId },
    });
    if (!school) {
      throw new NotFoundException('Escuela no encontrada');
    }

    // Verificar que el año académico existe
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: dto.academicYearId },
    });
    if (!academicYear) {
      throw new NotFoundException('Año académico no encontrado');
    }

    // Verificar que no exista un grupo con la misma combinación
    const existing = await this.prisma.gradeSection.findFirst({
      where: {
        schoolId: dto.schoolId,
        academicYearId: dto.academicYearId,
        grade: dto.grade,
        section: dto.section,
        level: dto.level,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un grupo ${dto.grade}° ${dto.section} de ${dto.level} para este año académico`,
      );
    }

    return this.prisma.gradeSection.create({
      data: {
        grade: dto.grade,
        section: dto.section,
        level: dto.level,
        capacity: dto.capacity || 30,
        classroom: dto.classroom,
        schoolId: dto.schoolId,
        academicYearId: dto.academicYearId,
      },
      include: {
        school: { select: { name: true } },
        academicYear: { select: { id: true, name: true } },
        _count: { select: { students: true, courses: true } },
      },
    });
  }

  async findAll(query: QueryGroupsDto) {
    const { schoolId, academicYearId, level, grade, page = 1, limit = 20 } = query;

    const where: Prisma.GradeSectionWhereInput = {
      ...(schoolId && { schoolId }),
      ...(academicYearId && { academicYearId }),
      ...(level && { level }),
      ...(grade && { grade }),
      isActive: true,
    };

    const [data, total] = await Promise.all([
      this.prisma.gradeSection.findMany({
        where,
        include: {
          school: { select: { name: true } },
          academicYear: { select: { id: true, name: true } },
          _count: { select: { students: true, courses: true } },
        },
        orderBy: [{ level: 'asc' }, { grade: 'asc' }, { section: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.gradeSection.count({ where }),
    ]);

    return {
      data: data.map((g) => ({
        id: g.id,
        name: `${g.grade}° ${g.section}`,
        grade: g.grade,
        section: g.section,
        level: g.level,
        capacity: g.capacity,
        classroom: g.classroom,
        school: g.school,
        academicYear: g.academicYear,
        studentsCount: g._count.students,
        coursesCount: g._count.courses,
        isActive: g.isActive,
        createdAt: g.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const group = await this.prisma.gradeSection.findUnique({
      where: { id },
      include: {
        school: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } },
        _count: { select: { students: true, courses: true } },
      },
    });

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    return {
      id: group.id,
      name: `${group.grade}° ${group.section}`,
      grade: group.grade,
      section: group.section,
      level: group.level,
      capacity: group.capacity,
      classroom: group.classroom,
      school: group.school,
      academicYear: group.academicYear,
      studentsCount: group._count.students,
      coursesCount: group._count.courses,
      isActive: group.isActive,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  async findStudents(id: string) {
    const group = await this.prisma.gradeSection.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const students = await this.prisma.student.findMany({
      where: {
        gradeSectionId: id,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { user: { lastName: 'asc' } },
        { user: { firstName: 'asc' } },
      ],
    });

    return {
      group: {
        id: group.id,
        name: `${group.grade}° ${group.section}`,
        level: group.level,
      },
      students: students.map((s) => ({
        id: s.id,
        studentCode: s.studentCode,
        firstName: s.user.firstName,
        lastName: s.user.lastName,
        email: s.user.email,
        avatar: s.user.avatar,
        gender: s.gender,
        birthDate: s.birthDate,
      })),
      total: students.length,
    };
  }

  async update(id: string, dto: UpdateGroupDto) {
    await this.findOne(id);

    return this.prisma.gradeSection.update({
      where: { id },
      data: {
        ...(dto.grade !== undefined && { grade: dto.grade }),
        ...(dto.section && { section: dto.section }),
        ...(dto.level && { level: dto.level }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.classroom !== undefined && { classroom: dto.classroom }),
      },
      include: {
        school: { select: { name: true } },
        academicYear: { select: { id: true, name: true } },
        _count: { select: { students: true, courses: true } },
      },
    });
  }

  async remove(id: string) {
    const group = await this.findOne(id);

    // Verificar si tiene estudiantes
    if (group.studentsCount > 0) {
      throw new ConflictException(
        'No se puede eliminar un grupo que tiene estudiantes asignados',
      );
    }

    await this.prisma.gradeSection.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Grupo desactivado exitosamente' };
  }

  async getStats(schoolId: string, academicYearId?: string) {
    const where: Prisma.GradeSectionWhereInput = {
      schoolId,
      ...(academicYearId && { academicYearId }),
      isActive: true,
    };

    const groups = await this.prisma.gradeSection.findMany({
      where,
      include: {
        _count: { select: { students: true } },
      },
    });

    const byLevel = groups.reduce(
      (acc, g) => {
        if (!acc[g.level]) {
          acc[g.level] = { groups: 0, students: 0 };
        }
        acc[g.level].groups += 1;
        acc[g.level].students += g._count.students;
        return acc;
      },
      {} as Record<string, { groups: number; students: number }>,
    );

    return {
      totalGroups: groups.length,
      totalStudents: groups.reduce((sum, g) => sum + g._count.students, 0),
      averageStudentsPerGroup:
        groups.length > 0
          ? Math.round(
              groups.reduce((sum, g) => sum + g._count.students, 0) /
                groups.length,
            )
          : 0,
      byLevel: Object.entries(byLevel).map(([level, data]) => ({
        level,
        ...data,
      })),
    };
  }
}
