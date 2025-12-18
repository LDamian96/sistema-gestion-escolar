import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ example: 550.00, description: 'Monto del pago' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ enum: PaymentStatus, description: 'Estado del pago' })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Método de pago' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha de vencimiento' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'Actualización de notas', description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;
}
