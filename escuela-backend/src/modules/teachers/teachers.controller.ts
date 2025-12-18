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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Teachers')
@ApiCookieAuth()
@Controller('teachers')
export class TeachersController {
  constructor(private teachersService: TeachersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo profesor' })
  @ApiResponse({ status: 201, description: 'Profesor creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email o código ya existe' })
  async create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar profesores' })
  @ApiQuery({ name: 'schoolId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de profesores' })
  async findAll(
    @Query('schoolId') schoolId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.teachersService.findAll(schoolId, search, active);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener un profesor por ID' })
  @ApiParam({ name: 'id', description: 'ID del profesor' })
  @ApiResponse({ status: 200, description: 'Profesor encontrado' })
  @ApiResponse({ status: 404, description: 'Profesor no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teachersService.findOne(id);
  }

  @Get(':id/courses')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener cursos de un profesor' })
  @ApiParam({ name: 'id', description: 'ID del profesor' })
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiResponse({ status: 200, description: 'Lista de cursos' })
  async getCourses(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.teachersService.getCourses(id, academicYearId);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un profesor' })
  @ApiParam({ name: 'id', description: 'ID del profesor' })
  @ApiResponse({ status: 200, description: 'Profesor actualizado' })
  @ApiResponse({ status: 404, description: 'Profesor no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar o desactivar un profesor' })
  @ApiParam({ name: 'id', description: 'ID del profesor' })
  @ApiResponse({ status: 200, description: 'Profesor eliminado/desactivado' })
  @ApiResponse({ status: 404, description: 'Profesor no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teachersService.remove(id);
  }
}
