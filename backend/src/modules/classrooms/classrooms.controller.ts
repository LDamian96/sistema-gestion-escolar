import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto, UpdateClassroomDto } from './dto/create-classroom.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../../generated/prisma';

@ApiTags('Classrooms')
@Controller('classrooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo aula' })
  create(@Body() data: CreateClassroomDto) {
    return this.classroomsService.create(data);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Listar todas las aulas' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por sección' })
  findAll(@Query('sectionId') sectionId?: string) {
    return this.classroomsService.findAll(sectionId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener un aula por ID' })
  findOne(@Param('id') id: string) {
    return this.classroomsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un aula' })
  update(@Param('id') id: string, @Body() data: UpdateClassroomDto) {
    return this.classroomsService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un aula' })
  remove(@Param('id') id: string) {
    return this.classroomsService.remove(id);
  }
}
