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
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Schedules')
@ApiCookieAuth()
@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo horario' })
  @ApiResponse({ status: 201, description: 'Horario creado' })
  async create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Listar horarios' })
  @ApiQuery({ name: 'gradeSectionId', required: false })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'dayOfWeek', required: false, type: Number, description: '0=Domingo, 1=Lunes, ..., 6=Sábado' })
  @ApiResponse({ status: 200, description: 'Lista de horarios' })
  async findAll(
    @Query('gradeSectionId') gradeSectionId?: string,
    @Query('courseId') courseId?: string,
    @Query('dayOfWeek') dayOfWeek?: string,
  ) {
    const day = dayOfWeek !== undefined ? parseInt(dayOfWeek, 10) : undefined;
    return this.schedulesService.findAll(gradeSectionId, courseId, day);
  }

  @Get('grade-section/:gradeSectionId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener horario completo de una sección' })
  @ApiParam({ name: 'gradeSectionId', description: 'ID de la sección' })
  @ApiResponse({ status: 200, description: 'Horario de la sección' })
  async findByGradeSection(@Param('gradeSectionId', ParseUUIDPipe) gradeSectionId: string) {
    return this.schedulesService.findByGradeSection(gradeSectionId);
  }

  @Get('teacher/:teacherId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener horario de un profesor' })
  @ApiParam({ name: 'teacherId', description: 'ID del profesor' })
  @ApiResponse({ status: 200, description: 'Horario del profesor' })
  async findByTeacher(@Param('teacherId', ParseUUIDPipe) teacherId: string) {
    return this.schedulesService.findByTeacher(teacherId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener un horario por ID' })
  @ApiParam({ name: 'id', description: 'ID del horario' })
  @ApiResponse({ status: 200, description: 'Horario encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un horario' })
  @ApiParam({ name: 'id', description: 'ID del horario' })
  @ApiResponse({ status: 200, description: 'Horario actualizado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un horario' })
  @ApiParam({ name: 'id', description: 'ID del horario' })
  @ApiResponse({ status: 200, description: 'Horario eliminado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.remove(id);
  }
}
