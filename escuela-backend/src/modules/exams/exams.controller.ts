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
import { ExamsService } from './exams.service';
import { CreateExamDto, UpdateExamDto, CreateQuestionDto, SubmitAnswerDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Exams')
@ApiCookieAuth()
@Controller('exams')
export class ExamsController {
  constructor(private examsService: ExamsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Crear un nuevo examen' })
  @ApiResponse({ status: 201, description: 'Examen creado' })
  async create(@Body() dto: CreateExamDto) {
    return this.examsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Listar exámenes' })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'teacherId', required: false })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de exámenes' })
  async findAll(
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('isPublished') isPublished?: string,
  ) {
    const published = isPublished === 'true' ? true : isPublished === 'false' ? false : undefined;
    return this.examsService.findAll(courseId, teacherId, published);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Obtener un examen por ID' })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({ status: 200, description: 'Examen encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.examsService.findOne(id);
  }

  @Get(':id/attempts')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener intentos de un examen' })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({ status: 200, description: 'Lista de intentos' })
  async getAttempts(@Param('id', ParseUUIDPipe) id: string) {
    return this.examsService.getAttempts(id);
  }

  @Get(':id/stats')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener estadísticas de un examen' })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({ status: 200, description: 'Estadísticas del examen' })
  async getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.examsService.getExamStats(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar un examen' })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({ status: 200, description: 'Examen actualizado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExamDto,
  ) {
    return this.examsService.update(id, dto);
  }

  @Put(':id/publish')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Publicar un examen' })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({ status: 200, description: 'Examen publicado' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.examsService.publish(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un examen' })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({ status: 200, description: 'Examen eliminado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.examsService.remove(id);
  }

  // ==================== QUESTIONS ====================

  @Post(':id/questions')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Agregar pregunta al examen' })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({ status: 201, description: 'Pregunta agregada' })
  async addQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.examsService.addQuestion(id, dto);
  }

  @Put('questions/:questionId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar una pregunta' })
  @ApiParam({ name: 'questionId', description: 'ID de la pregunta' })
  @ApiResponse({ status: 200, description: 'Pregunta actualizada' })
  async updateQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.examsService.updateQuestion(questionId, dto);
  }

  @Delete('questions/:questionId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una pregunta' })
  @ApiParam({ name: 'questionId', description: 'ID de la pregunta' })
  @ApiResponse({ status: 200, description: 'Pregunta eliminada' })
  async removeQuestion(@Param('questionId', ParseUUIDPipe) questionId: string) {
    return this.examsService.removeQuestion(questionId);
  }

  // ==================== ATTEMPTS ====================

  @Post(':id/start/:studentId')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Iniciar intento de examen' })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Intento iniciado' })
  async startAttempt(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.examsService.startAttempt(id, studentId);
  }

  @Post('attempts/:attemptId/answer')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Enviar respuesta' })
  @ApiParam({ name: 'attemptId', description: 'ID del intento' })
  @ApiResponse({ status: 200, description: 'Respuesta guardada' })
  async submitAnswer(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.examsService.submitAnswer(attemptId, dto);
  }

  @Post('attempts/:attemptId/finish')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Finalizar examen' })
  @ApiParam({ name: 'attemptId', description: 'ID del intento' })
  @ApiResponse({ status: 200, description: 'Examen finalizado' })
  async finishAttempt(@Param('attemptId', ParseUUIDPipe) attemptId: string) {
    return this.examsService.finishAttempt(attemptId);
  }

  @Get(':id/attempt/:studentId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.PARENT)
  @ApiOperation({ summary: 'Obtener intento de un estudiante' })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Intento encontrado' })
  async getStudentAttempt(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.examsService.getStudentAttempt(id, studentId);
  }
}
