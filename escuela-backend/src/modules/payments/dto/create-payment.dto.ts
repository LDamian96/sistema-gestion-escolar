import { IsString, IsNumber, IsOptional, IsUUID, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 500.00, description: 'Monto del pago' })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2024-12-31', description: 'Fecha de vencimiento' })
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional({ example: 'Pago correspondiente a diciembre', description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'ID del estudiante' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'ID de la escuela' })
  @IsUUID()
  schoolId!: string;

  @ApiProperty({ description: 'ID del concepto de pago' })
  @IsUUID()
  conceptId!: string;
}
