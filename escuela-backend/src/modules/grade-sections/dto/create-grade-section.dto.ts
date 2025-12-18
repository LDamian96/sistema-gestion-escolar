import { IsString, IsInt, IsBoolean, IsOptional, IsUUID, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Level } from '@prisma/client';

export class CreateGradeSectionDto {
  @ApiProperty({ example: 1, description: 'Grado (1-6)', minimum: 1, maximum: 6 })
  @IsInt()
  @Min(1)
  @Max(6)
  grade!: number;

  @ApiProperty({ example: 'A', description: 'Sección (A, B, C, etc.)' })
  @IsString()
  section!: string;

  @ApiProperty({ enum: Level, example: 'PRIMARIA', description: 'Nivel educativo' })
  @IsEnum(Level)
  level!: Level;

  @ApiPropertyOptional({ example: 30, description: 'Capacidad máxima' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  capacity?: number;

  @ApiPropertyOptional({ example: 'Aula 101', description: 'Aula asignada' })
  @IsOptional()
  @IsString()
  classroom?: string;

  @ApiProperty({ description: 'ID de la escuela' })
  @IsUUID()
  schoolId!: string;

  @ApiProperty({ description: 'ID del año académico' })
  @IsUUID()
  academicYearId!: string;
}
