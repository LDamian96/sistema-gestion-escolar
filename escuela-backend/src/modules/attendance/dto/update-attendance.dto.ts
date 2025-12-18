import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ enum: AttendanceStatus, example: 'LATE', description: 'Estado de asistencia' })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Justificó con certificado médico', description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;
}
