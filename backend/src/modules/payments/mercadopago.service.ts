import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment as MPPayment } from 'mercadopago';

export interface CreatePreferenceDto {
  paymentId: string;
  title: string;
  description: string;
  amount: number;
  studentName: string;
  payerEmail?: string;
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private client: MercadoPagoConfig;
  private preference: Preference;
  private mpPayment: MPPayment;

  constructor(private configService: ConfigService) {
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      this.logger.warn('MERCADOPAGO_ACCESS_TOKEN no configurado');
      return;
    }

    this.client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 }
    });

    this.preference = new Preference(this.client);
    this.mpPayment = new MPPayment(this.client);

    this.logger.log('MercadoPago configurado correctamente');
  }

  async createPreference(data: CreatePreferenceDto): Promise<PreferenceResponse> {
    if (!this.preference) {
      throw new BadRequestException('MercadoPago no está configurado');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    try {
      const response = await this.preference.create({
        body: {
          items: [
            {
              id: data.paymentId,
              title: data.title,
              description: data.description,
              quantity: 1,
              unit_price: data.amount,
              currency_id: 'PEN', // Soles peruanos
            },
          ],
          payer: {
            name: data.studentName,
            email: data.payerEmail || 'payer@email.com',
          },
          back_urls: {
            success: `${frontendUrl}/admin/pagos?status=success&payment_id=${data.paymentId}`,
            failure: `${frontendUrl}/admin/pagos?status=failure&payment_id=${data.paymentId}`,
            pending: `${frontendUrl}/admin/pagos?status=pending&payment_id=${data.paymentId}`,
          },
          // auto_return solo funciona con URLs públicas, lo omitimos en desarrollo
          external_reference: data.paymentId,
          notification_url: `${this.configService.get('BACKEND_URL') || 'http://localhost:4000'}/api/payments/webhook/mercadopago`,
          statement_descriptor: 'COLEGIO SAN JOSE',
        },
      });

      this.logger.log(`Preferencia creada: ${response.id}`);

      return {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error('Error creando preferencia de MercadoPago:', error);
      throw new BadRequestException(`Error al crear preferencia de pago: ${error.message}`);
    }
  }

  async getPaymentInfo(mpPaymentId: string) {
    if (!this.mpPayment) {
      throw new BadRequestException('MercadoPago no está configurado');
    }

    try {
      const response = await this.mpPayment.get({ id: mpPaymentId });
      return {
        id: response.id,
        status: response.status,
        status_detail: response.status_detail,
        external_reference: response.external_reference,
        transaction_amount: response.transaction_amount,
        date_approved: response.date_approved,
        payment_method_id: response.payment_method_id,
        payer: response.payer,
      };
    } catch (error) {
      this.logger.error('Error obteniendo info de pago:', error);
      throw new BadRequestException(`Error al obtener información del pago: ${error.message}`);
    }
  }

  getPublicKey(): string {
    return this.configService.get<string>('MERCADOPAGO_PUBLIC_KEY') || '';
  }
}
