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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto, UpdateAttendanceDto, MarkAllAttendanceDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Attendance')
@ApiCookieAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Registrar asistencia individual' })
  @ApiResponse({ status: 201, description: 'Asistencia registrada' })
  async create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Listar asistencias' })
  @ApiQuery({ name: 'gradeSectionId', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'Formato: YYYY-MM-DD' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiResponse({ status: 200, description: 'Lista de asistencias' })
  async findAll(
    @Query('gradeSectionId') gradeSectionId?: string,
    @Query('date') date?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.attendanceService.findAll(gradeSectionId, date, studentId);
  }

  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener asistencia por curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiQuery({ name: 'date', required: false, description: 'Formato: YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Lista de asistencias del curso' })
  async findByCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.findByCourse(courseId, date);
  }

  @Get('student/:studentId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener asistencia por estudiante' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha inicio YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha fin YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Lista de asistencias del estudiante' })
  async findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.findByStudent(studentId, startDate, endDate);
  }

  @Get('summary/:studentId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener resumen de asistencia de un estudiante' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha inicio YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha fin YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Resumen de asistencia' })
  async getSummary(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getSummary(studentId, startDate, endDate);
  }

  @Get('section/:gradeSectionId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener asistencia de una sección para una fecha' })
  @ApiParam({ name: 'gradeSectionId', description: 'ID de la sección' })
  @ApiQuery({ name: 'date', required: true, description: 'Fecha YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Asistencia de la sección' })
  async getGradeSectionAttendance(
    @Param('gradeSectionId', ParseUUIDPipe) gradeSectionId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getGradeSectionAttendance(gradeSectionId, date);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener un registro de asistencia por ID' })
  @ApiParam({ name: 'id', description: 'ID del registro de asistencia' })
  @ApiResponse({ status: 200, description: 'Registro de asistencia encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar un registro de asistencia' })
  @ApiParam({ name: 'id', description: 'ID del registro de asistencia' })
  @ApiResponse({ status: 200, description: 'Registro actualizado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un registro de asistencia' })
  @ApiParam({ name: 'id', description: 'ID del registro de asistencia' })
  @ApiResponse({ status: 200, description: 'Registro eliminado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.remove(id);
  }

  @Post('mark-all')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Registrar asistencia de múltiples estudiantes' })
  @ApiResponse({ status: 201, description: 'Asistencias registradas' })
  async markAll(@Body() dto: MarkAllAttendanceDto) {
    return this.attendanceService.markAll(dto);
  }
}
