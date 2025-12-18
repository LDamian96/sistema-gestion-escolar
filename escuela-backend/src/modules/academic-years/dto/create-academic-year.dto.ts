import { IsString, IsDateString, IsBoolean, IsOptional, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2024-2025', description: 'Nombre del año académico' })
  @IsString()
  @MinLength(4)
  name!: string;

  @ApiProperty({ example: '2024-03-01', description: 'Fecha de inicio' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2024-12-15', description: 'Fecha de fin' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: true, description: 'Es el año actual' })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiProperty({ description: 'ID de la escuela' })
  @IsUUID()
  schoolId!: string;
}
