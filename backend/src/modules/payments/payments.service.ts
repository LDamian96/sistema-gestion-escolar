import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '../../../generated/prisma';
import { MercadoPagoService, CreatePreferenceDto } from './mercadopago.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private mercadoPagoService: MercadoPagoService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, schoolId: string) {
    const { studentId, dueDate, ...data } = createPaymentDto;

    // Verificar que el estudiante existe y pertenece a la escuela
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId,
      },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return this.prisma.payment.create({
      data: {
        schoolId,
        studentId,
        dueDate: new Date(dueDate),
        ...data,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            enrollmentCode: true,
          },
        },
      },
    });
  }

  async findAll(schoolId: string, studentId?: string) {
    return this.prisma.payment.findMany({
      where: {
        schoolId,
        ...(studentId && { studentId }),
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            enrollmentCode: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });
  }

  async findOne(id: string, schoolId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        schoolId,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            enrollmentCode: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    return payment;
  }

  // Crear preferencia de pago con Mercado Pago
  async createMercadoPagoPreference(paymentId: string, schoolId: string) {
    const payment = await this.findOne(paymentId, schoolId);

    const preferenceData: CreatePreferenceDto = {
      paymentId: payment.id,
      title: payment.description || 'Pago de colegiatura',
      description: `Pago para ${payment.student.firstName} ${payment.student.lastName}`,
      amount: Number(payment.amount),
      studentName: `${payment.student.firstName} ${payment.student.lastName}`,
      payerEmail: payment.student.user?.email,
    };

    const preference = await this.mercadoPagoService.createPreference(preferenceData);

    // Guardar ID de preferencia en el pago
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        transactionId: preference.id,
        paymentMethod: 'MercadoPago',
      },
    });

    return {
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      publicKey: this.mercadoPagoService.getPublicKey(),
    };
  }

  // Procesar webhook de Mercado Pago
  async processMercadoPagoWebhook(type: string, data: { id: string }) {
    this.logger.log(`Webhook recibido: ${type} - ${data.id}`);

    if (type !== 'payment') {
      return { message: 'Evento ignorado' };
    }

    try {
      const mpPayment = await this.mercadoPagoService.getPaymentInfo(data.id);

      if (!mpPayment.external_reference) {
        this.logger.warn('Pago sin external_reference');
        return { message: 'Pago sin referencia' };
      }

      const paymentId = mpPayment.external_reference;

      // Buscar el pago en nuestra BD
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        this.logger.warn(`Pago no encontrado: ${paymentId}`);
        return { message: 'Pago no encontrado' };
      }

      // Mapear estado de MP a nuestro estado
      let status: PaymentStatus = PaymentStatus.PENDING;
      if (mpPayment.status === 'approved') {
        status = PaymentStatus.PAID;
      } else if (mpPayment.status === 'rejected' || mpPayment.status === 'cancelled') {
        status = PaymentStatus.CANCELLED;
      }

      // Actualizar pago
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status,
          transactionId: data.id,
          paidDate: mpPayment.date_approved ? new Date(mpPayment.date_approved) : null,
          paymentMethod: `MercadoPago - ${mpPayment.payment_method_id || 'N/A'}`,
        },
      });

      this.logger.log(`Pago ${paymentId} actualizado a ${status}`);
      return { message: 'Pago procesado', status };
    } catch (error) {
      this.logger.error('Error procesando webhook:', error);
      throw error;
    }
  }

  // Verificar estado de pago en Mercado Pago
  async checkMercadoPagoPayment(paymentId: string, mpPaymentId: string, schoolId: string) {
    await this.findOne(paymentId, schoolId); // Validar que existe

    const mpPayment = await this.mercadoPagoService.getPaymentInfo(mpPaymentId);

    // Actualizar estado si es aprobado
    if (mpPayment.status === 'approved') {
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.PAID,
          paidDate: new Date(mpPayment.date_approved),
          transactionId: mpPaymentId,
          paymentMethod: `MercadoPago - ${mpPayment.payment_method_id}`,
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return { payment: updatedPayment, mpStatus: mpPayment.status };
    }

    return { mpStatus: mpPayment.status, mpPayment };
  }

  // Procesar pago con Yape
  async processYapePayment(paymentId: string, phoneNumber: string, schoolId: string) {
    const payment = await this.findOne(paymentId, schoolId);

    // Simular integración con Yape
    const yapeConfig = {
      merchantId: this.configService.get('YAPE_MERCHANT_ID'),
      apiKey: this.configService.get('YAPE_API_KEY'),
      phoneNumber: this.configService.get('YAPE_PHONE_NUMBER'),
    };

    // Simulación de respuesta de Yape
    const yapeMockResponse = {
      success: true,
      transactionId: `YAPE-${Date.now()}`,
      amount: payment.amount,
      phoneNumber,
      merchantPhone: yapeConfig.phoneNumber,
      status: 'approved',
    };

    if (yapeMockResponse.success) {
      return this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.PAID,
          paidDate: new Date(),
          paymentMethod: 'Yape',
          transactionId: yapeMockResponse.transactionId,
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }

    throw new Error('Error procesando pago con Yape');
  }

  // Estadísticas de pagos
  async getPaymentStats(schoolId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { schoolId },
      select: {
        status: true,
        amount: true,
      },
    });

    const stats = payments.reduce(
      (acc, payment) => {
        acc.total += Number(payment.amount);
        acc.byStatus[payment.status] = (acc.byStatus[payment.status] || 0) + 1;
        acc.totalByStatus[payment.status] =
          (acc.totalByStatus[payment.status] || 0) + Number(payment.amount);
        return acc;
      },
      {
        total: 0,
        byStatus: {} as Record<string, number>,
        totalByStatus: {} as Record<string, number>,
      },
    );

    return {
      count: payments.length,
      ...stats,
    };
  }

  // Obtener public key de Mercado Pago
  getMercadoPagoPublicKey() {
    return {
      publicKey: this.mercadoPagoService.getPublicKey(),
    };
  }
}
