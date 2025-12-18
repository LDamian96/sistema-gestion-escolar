import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { CurriculumService } from './curriculum.service';
import {
  CreateCurriculumTopicDto,
  UpdateCurriculumTopicDto,
  QueryCurriculumDto,
  CreateMonthlyTopicDto,
} from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Curriculum')
@ApiCookieAuth()
@Controller('curriculum')
export class CurriculumController {
  constructor(private curriculumService: CurriculumService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Crear tema curricular' })
  @ApiResponse({ status: 201, description: 'Tema creado' })
  async create(
    @Body() dto: CreateCurriculumTopicDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.curriculumService.create(dto, userId, role);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @ApiOperation({ summary: 'Listar temas curriculares' })
  @ApiResponse({ status: 200, description: 'Lista de temas' })
  async findAll(@Query() query: QueryCurriculumDto) {
    return this.curriculumService.findAll(query);
  }

  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @ApiOperation({ summary: 'Obtener temas de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Temas del curso' })
  async findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.curriculumService.findByCourse(courseId);
  }

  @Get('course/:courseId/progress')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @ApiOperation({ summary: 'Obtener progreso curricular de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Progreso del curso' })
  async getProgress(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.curriculumService.getProgress(courseId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @ApiOperation({ summary: 'Obtener tema curricular por ID' })
  @ApiParam({ name: 'id', description: 'ID del tema' })
  @ApiResponse({ status: 200, description: 'Tema encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.curriculumService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar tema curricular' })
  @ApiParam({ name: 'id', description: 'ID del tema' })
  @ApiResponse({ status: 200, description: 'Tema actualizado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCurriculumTopicDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.curriculumService.update(id, dto, userId, role);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Eliminar tema curricular' })
  @ApiParam({ name: 'id', description: 'ID del tema' })
  @ApiResponse({ status: 200, description: 'Tema eliminado' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.curriculumService.remove(id, userId, role);
  }

  // Monthly Topics
  @Post('monthly-topics')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Crear tópico mensual' })
  @ApiResponse({ status: 201, description: 'Tópico creado' })
  async createMonthlyTopic(@Body() dto: CreateMonthlyTopicDto) {
    return this.curriculumService.createMonthlyTopic(dto);
  }

  @Patch('monthly-topics/:id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar tópico mensual' })
  @ApiParam({ name: 'id', description: 'ID del tópico' })
  @ApiResponse({ status: 200, description: 'Tópico actualizado' })
  async updateMonthlyTopic(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateMonthlyTopicDto>,
  ) {
    return this.curriculumService.updateMonthlyTopic(id, dto);
  }
}
