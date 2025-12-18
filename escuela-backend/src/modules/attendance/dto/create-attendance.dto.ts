import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';

export class CreateAttendanceDto {
  @ApiProperty({ example: '2024-03-15', description: 'Fecha de asistencia' })
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: AttendanceStatus, example: 'PRESENT', description: 'Estado de asistencia' })
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Llegó 10 minutos tarde', description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'ID del estudiante' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'ID de la sección/grado' })
  @IsUUID()
  gradeSectionId!: string;

  @ApiProperty({ description: 'ID del profesor que registra' })
  @IsUUID()
  teacherId!: string;
}
