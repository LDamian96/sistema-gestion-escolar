import { IsInt, IsString, IsOptional, IsUUID, Min, Max, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({ example: 1, description: 'Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: '08:00', description: 'Hora de inicio (formato HH:mm)' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido. Use HH:mm' })
  startTime!: string;

  @ApiProperty({ example: '09:30', description: 'Hora de fin (formato HH:mm)' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido. Use HH:mm' })
  endTime!: string;

  @ApiPropertyOptional({ example: 'Aula 101', description: 'Aula o sala asignada' })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ description: 'ID del curso' })
  @IsUUID()
  courseId!: string;

  @ApiProperty({ description: 'ID de la sección/grado' })
  @IsUUID()
  gradeSectionId!: string;
}
