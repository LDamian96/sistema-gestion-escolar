import { IsInt, IsString, IsOptional, Min, Max, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateScheduleDto {
  @ApiPropertyOptional({ example: 2, description: 'Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @ApiPropertyOptional({ example: '10:00', description: 'Hora de inicio (formato HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido. Use HH:mm' })
  startTime?: string;

  @ApiPropertyOptional({ example: '11:30', description: 'Hora de fin (formato HH:mm)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido. Use HH:mm' })
  endTime?: string;

  @ApiPropertyOptional({ example: 'Laboratorio 2', description: 'Aula o sala asignada' })
  @IsOptional()
  @IsString()
  room?: string;
}
