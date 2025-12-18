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
import { SchoolsService } from './schools.service';
import { CreateSchoolDto, UpdateSchoolDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Schools')
@ApiCookieAuth()
@Controller('schools')
@Roles(Role.ADMIN) // Solo ADMIN puede gestionar escuelas
export class SchoolsController {
  constructor(private schoolsService: SchoolsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva escuela' })
  @ApiResponse({ status: 201, description: 'Escuela creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Código ya existe' })
  async create(@Body() dto: CreateSchoolDto) {
    return this.schoolsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las escuelas' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o código' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de escuelas' })
  async findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.schoolsService.findAll(search, active);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una escuela por ID' })
  @ApiParam({ name: 'id', description: 'ID de la escuela' })
  @ApiResponse({ status: 200, description: 'Escuela encontrada' })
  @ApiResponse({ status: 404, description: 'Escuela no encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.schoolsService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtener estadísticas de una escuela' })
  @ApiParam({ name: 'id', description: 'ID de la escuela' })
  @ApiResponse({ status: 200, description: 'Estadísticas de la escuela' })
  @ApiResponse({ status: 404, description: 'Escuela no encontrada' })
  async getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.schoolsService.getStats(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una escuela' })
  @ApiParam({ name: 'id', description: 'ID de la escuela' })
  @ApiResponse({ status: 200, description: 'Escuela actualizada' })
  @ApiResponse({ status: 404, description: 'Escuela no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSchoolDto,
  ) {
    return this.schoolsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar o desactivar una escuela' })
  @ApiParam({ name: 'id', description: 'ID de la escuela' })
  @ApiResponse({ status: 200, description: 'Escuela eliminada o desactivada' })
  @ApiResponse({ status: 404, description: 'Escuela no encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.schoolsService.remove(id);
  }
}
