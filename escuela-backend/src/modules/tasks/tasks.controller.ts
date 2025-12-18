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
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, SubmitTaskDto, GradeSubmissionDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, SubmissionStatus } from '@prisma/client';

@ApiTags('Tasks')
@ApiCookieAuth()
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiResponse({ status: 201, description: 'Tarea creada' })
  async create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Listar tareas' })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'teacherId', required: false })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de tareas' })
  async findAll(
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('isPublished') isPublished?: string,
  ) {
    const published = isPublished === 'true' ? true : isPublished === 'false' ? false : undefined;
    return this.tasksService.findAll(courseId, teacherId, published);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Get(':id/submissions')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener entregas de una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiQuery({ name: 'status', required: false, enum: SubmissionStatus })
  @ApiResponse({ status: 200, description: 'Lista de entregas' })
  async getSubmissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status?: SubmissionStatus,
  ) {
    return this.tasksService.getSubmissions(id, status);
  }

  @Get(':id/stats')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener estadísticas de una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Estadísticas de la tarea' })
  async getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getTaskStats(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, dto);
  }

  @Put(':id/publish')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Publicar una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea publicada' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.publish(id);
  }

  @Post(':id/submit/:studentId')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Entregar una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Tarea entregada' })
  async submitTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Body() dto: SubmitTaskDto,
  ) {
    return this.tasksService.submitTask(id, studentId, dto);
  }

  @Get(':id/submission/:studentId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener entrega de un estudiante' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Entrega encontrada' })
  async getStudentSubmission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.tasksService.getStudentSubmission(id, studentId);
  }

  @Put('submissions/:submissionId/grade')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Calificar una entrega' })
  @ApiParam({ name: 'submissionId', description: 'ID de la entrega' })
  @ApiResponse({ status: 200, description: 'Entrega calificada' })
  async gradeSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.tasksService.gradeSubmission(submissionId, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
