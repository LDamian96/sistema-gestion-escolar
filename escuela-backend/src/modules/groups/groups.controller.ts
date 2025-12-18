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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, QueryGroupsDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Groups')
@ApiCookieAuth()
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo grupo' })
  @ApiResponse({ status: 201, description: 'Grupo creado' })
  async create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Listar grupos' })
  @ApiResponse({ status: 200, description: 'Lista de grupos' })
  async findAll(@Query() query: QueryGroupsDto) {
    return this.groupsService.findAll(query);
  }

  @Get('stats/:schoolId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas de grupos' })
  @ApiParam({ name: 'schoolId', description: 'ID de la escuela' })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  async getStats(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.groupsService.getStats(schoolId, academicYearId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener grupo por ID' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Grupo encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupsService.findOne(id);
  }

  @Get(':id/students')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener estudiantes del grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes' })
  async findStudents(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupsService.findStudents(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Grupo actualizado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Desactivar grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Grupo desactivado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupsService.remove(id);
  }
}
