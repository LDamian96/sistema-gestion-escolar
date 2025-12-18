import {
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Level } from '@prisma/client';

export class CreateGroupDto {
  @ApiProperty({ description: 'Grado (1-6)', example: 1 })
  @IsInt()
  @Min(1)
  @Max(6)
  grade!: number;

  @ApiProperty({ description: 'Seccion', example: 'A' })
  @IsString()
  section!: string;

  @ApiProperty({ description: 'Nivel educativo', enum: Level })
  @IsEnum(Level)
  level!: Level;

  @ApiPropertyOptional({ description: 'Capacidad maxima', default: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Aula asignada' })
  @IsOptional()
  @IsString()
  classroom?: string;

  @ApiProperty({ description: 'ID de la escuela' })
  @IsUUID()
  schoolId!: string;

  @ApiProperty({ description: 'ID del año academico' })
  @IsUUID()
  academicYearId!: string;
}
