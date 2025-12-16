import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../../generated/prisma';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear nuevo pago (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Pago creado exitosamente' })
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.paymentsService.create(createPaymentDto, schoolId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARENT, Role.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todos los pagos' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiResponse({ status: 200, description: 'Lista de pagos' })
  findAll(
    @CurrentUser('schoolId') schoolId: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.paymentsService.findAll(schoolId, studentId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Estadísticas de pagos' })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  getStats(@CurrentUser('schoolId') schoolId: string) {
    return this.paymentsService.getPaymentStats(schoolId);
  }

  @Get('mercadopago/public-key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARENT, Role.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener public key de Mercado Pago' })
  getPublicKey() {
    return this.paymentsService.getMercadoPagoPublicKey();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARENT, Role.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener pago por ID' })
  @ApiResponse({ status: 200, description: 'Detalle del pago' })
  findOne(@Param('id') id: string, @CurrentUser('schoolId') schoolId: string) {
    return this.paymentsService.findOne(id, schoolId);
  }

  @Post(':id/mercadopago')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARENT, Role.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear preferencia de pago con Mercado Pago' })
  @ApiResponse({ status: 200, description: 'Preferencia creada con URL de pago' })
  createMercadoPagoPreference(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.paymentsService.createMercadoPagoPreference(id, schoolId);
  }

  @Post(':id/mercadopago/check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARENT, Role.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verificar estado de pago en Mercado Pago' })
  checkMercadoPagoPayment(
    @Param('id') id: string,
    @Body('mpPaymentId') mpPaymentId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.paymentsService.checkMercadoPagoPayment(id, mpPaymentId, schoolId);
  }

  @Post('webhook/mercadopago')
  @ApiOperation({ summary: 'Webhook de Mercado Pago (No requiere auth)' })
  processMercadoPagoWebhook(
    @Query('type') type: string,
    @Query('data.id') dataId: string,
    @Body() body: any,
  ) {
    // MP envía el type en query o en body
    const eventType = type || body?.type;
    const paymentId = dataId || body?.data?.id;

    if (!eventType || !paymentId) {
      return { message: 'Webhook recibido sin datos' };
    }

    return this.paymentsService.processMercadoPagoWebhook(eventType, { id: paymentId });
  }

  @Post(':id/yape')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARENT, Role.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Procesar pago con Yape' })
  @ApiResponse({ status: 200, description: 'Pago procesado con Yape' })
  processYapePayment(
    @Param('id') id: string,
    @Body('phoneNumber') phoneNumber: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.paymentsService.processYapePayment(id, phoneNumber, schoolId);
  }
}
