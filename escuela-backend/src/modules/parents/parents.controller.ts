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
import { ParentsService } from './parents.service';
import { CreateParentDto, UpdateParentDto, AssignChildrenDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Parents')
@ApiCookieAuth()
@Controller('parents')
export class ParentsController {
  constructor(private parentsService: ParentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo padre/tutor' })
  @ApiResponse({ status: 201, description: 'Padre creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  async create(@Body() dto: CreateParentDto) {
    return this.parentsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar padres/tutores' })
  @ApiQuery({ name: 'schoolId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de padres' })
  async findAll(
    @Query('schoolId') schoolId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.parentsService.findAll(schoolId, search, active);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PARENT)
  @ApiOperation({ summary: 'Obtener un padre/tutor por ID' })
  @ApiParam({ name: 'id', description: 'ID del padre' })
  @ApiResponse({ status: 200, description: 'Padre encontrado' })
  @ApiResponse({ status: 404, description: 'Padre no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.parentsService.findOne(id);
  }

  @Get(':id/children')
  @Roles(Role.ADMIN, Role.PARENT)
  @ApiOperation({ summary: 'Obtener hijos de un padre/tutor' })
  @ApiParam({ name: 'id', description: 'ID del padre' })
  @ApiResponse({ status: 200, description: 'Lista de hijos' })
  async getChildren(@Param('id', ParseUUIDPipe) id: string) {
    return this.parentsService.getChildren(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un padre/tutor' })
  @ApiParam({ name: 'id', description: 'ID del padre' })
  @ApiResponse({ status: 200, description: 'Padre actualizado' })
  @ApiResponse({ status: 404, description: 'Padre no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateParentDto,
  ) {
    return this.parentsService.update(id, dto);
  }

  @Put(':id/children')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Asignar hijos a un padre/tutor' })
  @ApiParam({ name: 'id', description: 'ID del padre' })
  @ApiResponse({ status: 200, description: 'Hijos asignados' })
  async assignChildren(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignChildrenDto,
  ) {
    return this.parentsService.assignChildren(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar o desactivar un padre/tutor' })
  @ApiParam({ name: 'id', description: 'ID del padre' })
  @ApiResponse({ status: 200, description: 'Padre eliminado/desactivado' })
  @ApiResponse({ status: 404, description: 'Padre no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.parentsService.remove(id);
  }
}
