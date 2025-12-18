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
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Academic Years')
@ApiCookieAuth()
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private academicYearsService: AcademicYearsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo año académico' })
  @ApiResponse({ status: 201, description: 'Año académico creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() dto: CreateAcademicYearDto) {
    return this.academicYearsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Listar años académicos' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filtrar por escuela' })
  @ApiResponse({ status: 200, description: 'Lista de años académicos' })
  async findAll(@Query('schoolId') schoolId?: string) {
    return this.academicYearsService.findAll(schoolId);
  }

  @Get('current/:schoolId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener el año académico actual de una escuela' })
  @ApiParam({ name: 'schoolId', description: 'ID de la escuela' })
  @ApiResponse({ status: 200, description: 'Año académico actual' })
  @ApiResponse({ status: 404, description: 'No hay año actual configurado' })
  async findCurrent(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    return this.academicYearsService.findCurrent(schoolId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener un año académico por ID' })
  @ApiParam({ name: 'id', description: 'ID del año académico' })
  @ApiResponse({ status: 200, description: 'Año académico encontrado' })
  @ApiResponse({ status: 404, description: 'Año académico no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicYearsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un año académico' })
  @ApiParam({ name: 'id', description: 'ID del año académico' })
  @ApiResponse({ status: 200, description: 'Año académico actualizado' })
  @ApiResponse({ status: 404, description: 'Año académico no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.academicYearsService.update(id, dto);
  }

  @Put(':id/set-current')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Establecer como año académico actual' })
  @ApiParam({ name: 'id', description: 'ID del año académico' })
  @ApiResponse({ status: 200, description: 'Año académico establecido como actual' })
  @ApiResponse({ status: 404, description: 'Año académico no encontrado' })
  async setCurrent(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicYearsService.setCurrent(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un año académico' })
  @ApiParam({ name: 'id', description: 'ID del año académico' })
  @ApiResponse({ status: 200, description: 'Año académico eliminado' })
  @ApiResponse({ status: 400, description: 'Tiene datos asociados' })
  @ApiResponse({ status: 404, description: 'Año académico no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicYearsService.remove(id);
  }
}
