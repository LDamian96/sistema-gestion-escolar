import {
  Controller,
  Get,
  Post,
  Put,
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
import { GradesService } from './grades.service';
import { CreateGradeDto, UpdateGradeDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Grades')
@ApiCookieAuth()
@Controller('grades')
export class GradesController {
  constructor(private gradesService: GradesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Registrar una calificación' })
  @ApiResponse({ status: 201, description: 'Calificación registrada' })
  async create(@Body() dto: CreateGradeDto) {
    return this.gradesService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Listar calificaciones' })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'period', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['task', 'exam', 'participation', 'final'] })
  @ApiResponse({ status: 200, description: 'Lista de calificaciones' })
  async findAll(
    @Query('courseId') courseId?: string,
    @Query('studentId') studentId?: string,
    @Query('period') period?: string,
    @Query('type') type?: string,
  ) {
    const periodNum = period ? parseInt(period, 10) : undefined;
    return this.gradesService.findAll(courseId, studentId, periodNum, type);
  }

  @Get('student/:studentId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener calificaciones de un estudiante' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiResponse({ status: 200, description: 'Calificaciones del estudiante' })
  async findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.gradesService.findByStudent(studentId, courseId);
  }

  @Get('student/:studentId/report')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener reporte de calificaciones de un estudiante' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Reporte de calificaciones' })
  async getStudentReport(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.gradesService.getStudentReport(studentId);
  }

  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener calificaciones de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiQuery({ name: 'period', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Calificaciones del curso' })
  async findByCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query('period') period?: string,
  ) {
    const periodNum = period ? parseInt(period, 10) : undefined;
    return this.gradesService.findByCourse(courseId, periodNum);
  }

  @Get('course/:courseId/stats')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener estadísticas de calificaciones de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiQuery({ name: 'period', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Estadísticas del curso' })
  async getCourseStats(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query('period') period?: string,
  ) {
    const periodNum = period ? parseInt(period, 10) : undefined;
    return this.gradesService.getCourseStats(courseId, periodNum);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener una calificación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la calificación' })
  @ApiResponse({ status: 200, description: 'Calificación encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar una calificación' })
  @ApiParam({ name: 'id', description: 'ID de la calificación' })
  @ApiResponse({ status: 200, description: 'Calificación actualizada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGradeDto,
  ) {
    return this.gradesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una calificación' })
  @ApiParam({ name: 'id', description: 'ID de la calificación' })
  @ApiResponse({ status: 200, description: 'Calificación eliminada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradesService.remove(id);
  }
}
