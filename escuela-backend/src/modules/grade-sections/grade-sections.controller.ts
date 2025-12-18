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
import { GradeSectionsService } from './grade-sections.service';
import { CreateGradeSectionDto, UpdateGradeSectionDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, Level } from '@prisma/client';

@ApiTags('Grade Sections')
@ApiCookieAuth()
@Controller('grade-sections')
export class GradeSectionsController {
  constructor(private gradeSectionsService: GradeSectionsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva sección' })
  @ApiResponse({ status: 201, description: 'Sección creada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Sección ya existe' })
  async create(@Body() dto: CreateGradeSectionDto) {
    return this.gradeSectionsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Listar secciones' })
  @ApiQuery({ name: 'schoolId', required: false })
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiQuery({ name: 'level', required: false, enum: Level })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de secciones' })
  async findAll(
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('level') level?: Level,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.gradeSectionsService.findAll(schoolId, academicYearId, level, active);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener una sección por ID' })
  @ApiParam({ name: 'id', description: 'ID de la sección' })
  @ApiResponse({ status: 200, description: 'Sección encontrada' })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradeSectionsService.findOne(id);
  }

  @Get(':id/students')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener estudiantes de una sección' })
  @ApiParam({ name: 'id', description: 'ID de la sección' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes' })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  async getStudents(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradeSectionsService.getStudents(id);
  }

  @Get(':id/courses')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener cursos de una sección' })
  @ApiParam({ name: 'id', description: 'ID de la sección' })
  @ApiResponse({ status: 200, description: 'Lista de cursos' })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  async getCourses(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradeSectionsService.getCourses(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar una sección' })
  @ApiParam({ name: 'id', description: 'ID de la sección' })
  @ApiResponse({ status: 200, description: 'Sección actualizada' })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGradeSectionDto,
  ) {
    return this.gradeSectionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar o desactivar una sección' })
  @ApiParam({ name: 'id', description: 'ID de la sección' })
  @ApiResponse({ status: 200, description: 'Sección eliminada/desactivada' })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradeSectionsService.remove(id);
  }
}
