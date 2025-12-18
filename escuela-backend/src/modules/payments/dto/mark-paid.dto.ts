import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class MarkPaidDto {
  @ApiProperty({ enum: PaymentMethod, example: 'CASH', description: 'Método de pago utilizado' })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({ example: 'REC-001', description: 'Número de recibo' })
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @ApiPropertyOptional({ example: 'Pago en efectivo', description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;
}
