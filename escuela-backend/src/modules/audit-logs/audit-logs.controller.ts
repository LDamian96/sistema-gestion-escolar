import {
  Controller,
  Get,
  Post,
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
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto, QueryAuditLogDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('AuditLogs')
@ApiCookieAuth()
@Controller('audit-logs')
@Roles(Role.ADMIN) // Solo admin puede ver los logs de auditoría
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear registro de auditoría manualmente' })
  @ApiResponse({ status: 201, description: 'Registro creado' })
  async create(@Body() dto: CreateAuditLogDto) {
    return this.auditLogsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar registros de auditoría con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de registros' })
  async findAll(@Query() query: QueryAuditLogDto) {
    return this.auditLogsService.findAll(query);
  }

  @Get('stats/:schoolId')
  @ApiOperation({ summary: 'Obtener estadísticas de auditoría' })
  @ApiParam({ name: 'schoolId', description: 'ID de la escuela' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha inicio (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha fin (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  async getStats(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditLogsService.getStats(schoolId, startDate, endDate);
  }

  @Get('login-history/:schoolId')
  @ApiOperation({ summary: 'Obtener historial de logins' })
  @ApiParam({ name: 'schoolId', description: 'ID de la escuela' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados' })
  @ApiResponse({ status: 200, description: 'Historial de logins' })
  async getLoginHistory(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLogsService.getLoginHistory(schoolId, limit ? parseInt(limit) : 100);
  }

  @Get('resource/:resource/:resourceId')
  @ApiOperation({ summary: 'Obtener historial de un recurso específico' })
  @ApiParam({ name: 'resource', description: 'Tipo de recurso (User, Student, etc.)' })
  @ApiParam({ name: 'resourceId', description: 'ID del recurso' })
  @ApiResponse({ status: 200, description: 'Historial del recurso' })
  async findByResource(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.auditLogsService.findByResource(resource, resourceId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener actividad de un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados' })
  @ApiResponse({ status: 200, description: 'Actividad del usuario' })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLogsService.findByUser(userId, limit ? parseInt(limit) : 50);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro por ID' })
  @ApiParam({ name: 'id', description: 'ID del registro' })
  @ApiResponse({ status: 200, description: 'Registro encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditLogsService.findOne(id);
  }

  @Delete('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar registros antiguos' })
  @ApiQuery({ name: 'daysOld', required: false, description: 'Días de antigüedad (default: 90)' })
  @ApiResponse({ status: 200, description: 'Registros eliminados' })
  async deleteOldLogs(@Query('daysOld') daysOld?: string) {
    return this.auditLogsService.deleteOldLogs(daysOld ? parseInt(daysOld) : 90);
  }
}
