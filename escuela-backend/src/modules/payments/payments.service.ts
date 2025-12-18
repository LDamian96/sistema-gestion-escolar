import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto, MarkPaidDto, CreatePaymentConceptDto } from './dto';
import { PaymentStatus } from '@prisma/client';
import { MercadoPagoConfig, Preference, Payment as MPPayment } from 'mercadopago';
import { NotificationEventsService } from '../notifications/notification-events.service';

@Injectable()
export class PaymentsService {
  private mercadopago: MercadoPagoConfig;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private notificationEvents: NotificationEventsService,
  ) {
    this.mercadopago = new MercadoPagoConfig({
      accessToken: this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN') || '',
    });
  }

  // ==================== PAYMENT CONCEPTS ====================

  async createConcept(dto: CreatePaymentConceptDto) {
    return this.prisma.paymentConcept.create({
      data: {
        name: dto.name,
        description: dto.description,
        amount: dto.amount,
        isRecurrent: dto.isRecurrent || false,
        dueDay: dto.dueDay,
      },
    });
  }

  async findAllConcepts(isActive?: boolean) {
    return this.prisma.paymentConcept.findMany({
      where: {
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneConcept(id: string) {
    const concept = await this.prisma.paymentConcept.findUnique({
      where: { id },
    });
    if (!concept) {
      throw new NotFoundException('Concepto de pago no encontrado');
    }
    return concept;
  }

  async updateConcept(id: string, dto: Partial<CreatePaymentConceptDto>) {
    await this.findOneConcept(id);
    return this.prisma.paymentConcept.update({
      where: { id },
      data: dto,
    });
  }

  async removeConcept(id: string) {
    await this.findOneConcept(id);
    // Soft delete - marcar como inactivo
    await this.prisma.paymentConcept.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Concepto de pago desactivado exitosamente' };
  }

  // ==================== PAYMENTS ====================

  async create(dto: CreatePaymentDto) {
    // Verificar que el estudiante existe
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Verificar que el concepto existe
    const concept = await this.prisma.paymentConcept.findUnique({
      where: { id: dto.conceptId },
    });
    if (!concept) {
      throw new NotFoundException('Concepto de pago no encontrado');
    }

    return this.prisma.payment.create({
      data: {
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        notes: dto.notes,
        studentId: dto.studentId,
        schoolId: dto.schoolId,
        conceptId: dto.conceptId,
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        concept: true,
      },
    });
  }

  async findAll(status?: PaymentStatus, schoolId?: string) {
    return this.prisma.payment.findMany({
      where: {
        ...(status && { status }),
        ...(schoolId && { schoolId }),
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        concept: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        concept: true,
        school: true,
      },
    });
    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    await this.findOne(id);

    return this.prisma.payment.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.status && { status: dto.status }),
        ...(dto.method && { method: dto.method }),
        ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        concept: true,
      },
    });
  }

  async remove(id: string) {
    const payment = await this.findOne(id);
    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('No se puede eliminar un pago ya realizado');
    }
    await this.prisma.payment.delete({ where: { id } });
    return { message: 'Pago eliminado exitosamente' };
  }

  async findByStudent(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return this.prisma.payment.findMany({
      where: { studentId },
      include: {
        concept: true,
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  async findByParent(parentId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
      include: {
        children: {
          select: { studentId: true },
        },
      },
    });
    if (!parent) {
      throw new NotFoundException('Padre/Tutor no encontrado');
    }

    const studentIds = parent.children.map(c => c.studentId);

    return this.prisma.payment.findMany({
      where: {
        studentId: { in: studentIds },
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        concept: true,
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  async markAsPaid(id: string, dto: MarkPaidDto) {
    const payment = await this.findOne(id);

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Este pago ya fue realizado');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.PAID,
        method: dto.method,
        receiptNumber: dto.receiptNumber,
        paidAt: new Date(),
        notes: dto.notes ? `${payment.notes || ''}\n${dto.notes}`.trim() : payment.notes,
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        concept: true,
      },
    });

    // Enviar notificación de pago confirmado
    await this.notificationEvents.onPaymentConfirmed(
      {
        id: updatedPayment.id,
        amount: updatedPayment.amount,
        concept: updatedPayment.concept,
        student: {
          id: updatedPayment.studentId,
          user: updatedPayment.student.user,
        },
      },
      payment.schoolId,
    );

    return updatedPayment;
  }

  // ==================== MERCADOPAGO ====================

  async createMercadoPagoPreference(paymentId: string, backUrls: { success: string; failure: string; pending: string }) {
    const payment = await this.findOne(paymentId);

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Este pago ya fue realizado');
    }

    try {
      const preference = new Preference(this.mercadopago);

      const preferenceData = await preference.create({
        body: {
          items: [
            {
              id: payment.id,
              title: `${payment.concept.name} - ${payment.student.user.firstName} ${payment.student.user.lastName}`,
              description: payment.concept.description || payment.concept.name,
              quantity: 1,
              unit_price: payment.amount,
              currency_id: process.env.MERCADOPAGO_CURRENCY || 'PEN',
            },
          ],
          payer: {
            email: payment.student.user.email || 'test@test.com',
          },
          back_urls: backUrls,
          auto_return: 'approved' as const,
          external_reference: payment.id,
        },
      });

      // Guardar el ID de preferencia
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          metadata: {
            mercadopago_preference_id: preferenceData.id,
          },
        },
      });

      return {
        preferenceId: preferenceData.id,
        initPoint: preferenceData.init_point,
        sandboxInitPoint: preferenceData.sandbox_init_point,
      };
    } catch (error: any) {
      console.error('MercadoPago error:', JSON.stringify(error, null, 2));
      const errorMessage = error?.cause?.message || error?.message || JSON.stringify(error);
      throw new BadRequestException(`Error al crear preferencia de MercadoPago: ${errorMessage}`);
    }
  }

  async handleMercadoPagoWebhook(data: { type: string; data: { id: string } }) {
    if (data.type !== 'payment') {
      return { received: true };
    }

    try {
      const mpPayment = new MPPayment(this.mercadopago);
      const paymentInfo = await mpPayment.get({ id: data.data.id });

      if (paymentInfo.status === 'approved' && paymentInfo.external_reference) {
        const payment = await this.prisma.payment.findUnique({
          where: { id: paymentInfo.external_reference },
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
            concept: true,
          },
        });

        if (payment && payment.status !== PaymentStatus.PAID) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.PAID,
              method: 'MERCADOPAGO',
              transactionId: data.data.id,
              paidAt: new Date(),
              metadata: {
                mercadopago_payment_id: data.data.id,
                mercadopago_status: paymentInfo.status,
              },
            },
          });

          // Enviar notificación de pago confirmado
          await this.notificationEvents.onPaymentConfirmed(
            {
              id: payment.id,
              amount: payment.amount,
              concept: payment.concept,
              student: {
                id: payment.studentId,
                user: payment.student.user,
              },
            },
            payment.schoolId,
          );
        }
      }

      return { received: true, processed: true };
    } catch (error) {
      console.error('Error processing MercadoPago webhook:', error);
      return { received: true, processed: false };
    }
  }

  // ==================== STATS ====================

  async getPaymentStats(schoolId: string) {
    const [total, pending, paid, overdue] = await Promise.all([
      this.prisma.payment.count({ where: { schoolId } }),
      this.prisma.payment.count({ where: { schoolId, status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { schoolId, status: PaymentStatus.PAID } }),
      this.prisma.payment.count({ where: { schoolId, status: PaymentStatus.OVERDUE } }),
    ]);

    const [totalAmount, paidAmount, pendingAmount] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { schoolId },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { schoolId, status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { schoolId, status: PaymentStatus.PENDING },
        _sum: { amount: true },
      }),
    ]);

    return {
      counts: { total, pending, paid, overdue },
      amounts: {
        total: totalAmount._sum.amount || 0,
        paid: paidAmount._sum.amount || 0,
        pending: pendingAmount._sum.amount || 0,
      },
      collectionRate: total > 0 ? Math.round((paid / total) * 100 * 100) / 100 : 0,
    };
  }
}
