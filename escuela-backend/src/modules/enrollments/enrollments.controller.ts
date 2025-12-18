import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Enrollments')
@ApiCookieAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear una matrícula' })
  @ApiResponse({ status: 201, description: 'Matrícula creada' })
  @ApiResponse({ status: 409, description: 'Ya está matriculado' })
  async create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Listar matrículas' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de matrículas' })
  async findAll(
    @Query('studentId') studentId?: string,
    @Query('courseId') courseId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.enrollmentsService.findAll(studentId, courseId, active);
  }

  @Get('student/:studentId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener cursos de un estudiante' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiResponse({ status: 200, description: 'Cursos del estudiante' })
  async getStudentEnrollments(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.enrollmentsService.getStudentEnrollments(studentId, academicYearId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener una matrícula por ID' })
  @ApiParam({ name: 'id', description: 'ID de la matrícula' })
  @ApiResponse({ status: 200, description: 'Matrícula encontrada' })
  @ApiResponse({ status: 404, description: 'Matrícula no encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar una matrícula' })
  @ApiParam({ name: 'id', description: 'ID de la matrícula' })
  @ApiResponse({ status: 200, description: 'Matrícula desactivada' })
  @ApiResponse({ status: 404, description: 'Matrícula no encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentsService.remove(id);
  }
}
