import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class StudentAttendanceDto {
  @ApiProperty({ description: 'ID del estudiante' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ enum: AttendanceStatus, example: 'PRESENT', description: 'Estado de asistencia' })
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkAllAttendanceDto {
  @ApiProperty({ example: '2024-03-15', description: 'Fecha de asistencia' })
  @IsDateString()
  date!: string;

  @ApiProperty({ description: 'ID de la sección/grado' })
  @IsUUID()
  gradeSectionId!: string;

  @ApiProperty({ description: 'ID del profesor que registra' })
  @IsUUID()
  teacherId!: string;

  @ApiProperty({ type: [StudentAttendanceDto], description: 'Lista de asistencias por estudiante' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceDto)
  records!: StudentAttendanceDto[];
}
