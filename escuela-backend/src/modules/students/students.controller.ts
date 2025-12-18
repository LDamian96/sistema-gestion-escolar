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
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, AssignParentsDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Students')
@ApiCookieAuth()
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo estudiante' })
  @ApiResponse({ status: 201, description: 'Estudiante creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email o código ya existe' })
  async create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Listar estudiantes' })
  @ApiQuery({ name: 'schoolId', required: false })
  @ApiQuery({ name: 'gradeSectionId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes' })
  async findAll(
    @Query('schoolId') schoolId?: string,
    @Query('gradeSectionId') gradeSectionId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.studentsService.findAll(schoolId, gradeSectionId, search, active);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT)
  @ApiOperation({ summary: 'Obtener un estudiante por ID' })
  @ApiParam({ name: 'id', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Estudiante encontrado' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.findOne(id);
  }

  @Get(':id/parents')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener padres de un estudiante' })
  @ApiParam({ name: 'id', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Lista de padres' })
  async getParents(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.getParents(id);
  }

  @Get(':id/enrollments')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener inscripciones de un estudiante' })
  @ApiParam({ name: 'id', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Lista de inscripciones' })
  async getEnrollments(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.getEnrollments(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un estudiante' })
  @ApiParam({ name: 'id', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Estudiante actualizado' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, dto);
  }

  @Put(':id/parents')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Asignar padres a un estudiante' })
  @ApiParam({ name: 'id', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Padres asignados' })
  async assignParents(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignParentsDto,
  ) {
    return this.studentsService.assignParents(id, dto);
  }

  @Put(':id/section/:sectionId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Asignar estudiante a una sección' })
  @ApiParam({ name: 'id', description: 'ID del estudiante' })
  @ApiParam({ name: 'sectionId', description: 'ID de la sección' })
  @ApiResponse({ status: 200, description: 'Estudiante asignado a sección' })
  async assignToSection(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
  ) {
    return this.studentsService.assignToSection(id, sectionId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar o desactivar un estudiante' })
  @ApiParam({ name: 'id', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Estudiante eliminado/desactivado' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.remove(id);
  }
}
