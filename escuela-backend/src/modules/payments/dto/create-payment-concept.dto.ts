import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentConceptDto {
  @ApiProperty({ example: 'Matrícula 2024', description: 'Nombre del concepto de pago' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Pago de matrícula anual', description: 'Descripción del concepto' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 500.00, description: 'Monto del concepto' })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ example: true, description: 'Si es un pago recurrente (mensual)' })
  @IsOptional()
  @IsBoolean()
  isRecurrent?: boolean;

  @ApiPropertyOptional({ example: 15, description: 'Día del mes para pagos recurrentes (1-31)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  dueDay?: number;
}
