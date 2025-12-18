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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto, MarkPaidDto, CreatePaymentConceptDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role, PaymentStatus } from '@prisma/client';

@ApiTags('Payments')
@ApiCookieAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // ==================== PAYMENT CONCEPTS ====================

  @Post('concepts')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear concepto de pago' })
  @ApiResponse({ status: 201, description: 'Concepto creado' })
  async createConcept(@Body() dto: CreatePaymentConceptDto) {
    return this.paymentsService.createConcept(dto);
  }

  @Get('concepts')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar conceptos de pago' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de conceptos' })
  async findAllConcepts(@Query('isActive') isActive?: string) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.paymentsService.findAllConcepts(active);
  }

  @Get('concepts/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener concepto por ID' })
  @ApiParam({ name: 'id', description: 'ID del concepto' })
  @ApiResponse({ status: 200, description: 'Concepto encontrado' })
  async findOneConcept(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOneConcept(id);
  }

  @Put('concepts/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar concepto' })
  @ApiParam({ name: 'id', description: 'ID del concepto' })
  @ApiResponse({ status: 200, description: 'Concepto actualizado' })
  async updateConcept(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePaymentConceptDto,
  ) {
    return this.paymentsService.updateConcept(id, dto);
  }

  @Delete('concepts/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar concepto' })
  @ApiParam({ name: 'id', description: 'ID del concepto' })
  @ApiResponse({ status: 200, description: 'Concepto desactivado' })
  async removeConcept(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.removeConcept(id);
  }

  // ==================== PAYMENTS ====================

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un pago' })
  @ApiResponse({ status: 201, description: 'Pago creado' })
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PARENT)
  @ApiOperation({ summary: 'Listar pagos' })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'schoolId', required: false })
  @ApiResponse({ status: 200, description: 'Lista de pagos' })
  async findAll(
    @Query('status') status?: PaymentStatus,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.paymentsService.findAll(status, schoolId);
  }

  @Get('stats/:schoolId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas de pagos' })
  @ApiParam({ name: 'schoolId', description: 'ID de la escuela' })
  @ApiResponse({ status: 200, description: 'Estadísticas de pagos' })
  async getStats(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    return this.paymentsService.getPaymentStats(schoolId);
  }

  @Get('student/:studentId')
  @Roles(Role.ADMIN, Role.PARENT)
  @ApiOperation({ summary: 'Obtener pagos de un estudiante' })
  @ApiParam({ name: 'studentId', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Pagos del estudiante' })
  async findByStudent(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.paymentsService.findByStudent(studentId);
  }

  @Get('parent/:parentId')
  @Roles(Role.ADMIN, Role.PARENT)
  @ApiOperation({ summary: 'Obtener pagos de hijos de un padre' })
  @ApiParam({ name: 'parentId', description: 'ID del padre' })
  @ApiResponse({ status: 200, description: 'Pagos de los hijos' })
  async findByParent(@Param('parentId', ParseUUIDPipe) parentId: string) {
    return this.paymentsService.findByParent(parentId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PARENT)
  @ApiOperation({ summary: 'Obtener un pago por ID' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({ status: 200, description: 'Pago encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un pago' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({ status: 200, description: 'Pago actualizado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un pago' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({ status: 200, description: 'Pago eliminado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.remove(id);
  }

  @Post(':id/pay')
  @Roles(Role.ADMIN, Role.PARENT)
  @ApiOperation({ summary: 'Marcar pago como realizado' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({ status: 200, description: 'Pago marcado como realizado' })
  async markAsPaid(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarkPaidDto,
  ) {
    return this.paymentsService.markAsPaid(id, dto);
  }

  // ==================== MERCADOPAGO ====================

  @Post('mercadopago/create')
  @Roles(Role.ADMIN, Role.PARENT)
  @ApiOperation({ summary: 'Crear preferencia de MercadoPago' })
  @ApiResponse({ status: 201, description: 'Preferencia creada' })
  async createMercadoPagoPreference(
    @Body() body: { paymentId: string; backUrls: { success: string; failure: string; pending: string } },
  ) {
    return this.paymentsService.createMercadoPagoPreference(body.paymentId, body.backUrls);
  }

  @Post('mercadopago/webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook de MercadoPago' })
  @ApiResponse({ status: 200, description: 'Webhook procesado' })
  async handleWebhook(@Body() body: { type: string; data: { id: string } }) {
    return this.paymentsService.handleMercadoPagoWebhook(body);
  }
}
