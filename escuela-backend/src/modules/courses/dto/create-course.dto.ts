import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GradeScale } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: 'Matemáticas 1A - 2024' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Curso de matemáticas básicas' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 4, description: 'Horas por semana', default: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  hoursPerWeek?: number;

  @ApiPropertyOptional({ enum: GradeScale, default: 'NUMERIC' })
  @IsOptional()
  @IsEnum(GradeScale)
  gradeScale?: GradeScale;

  @ApiProperty({ description: 'ID del profesor asignado' })
  @IsUUID()
  teacherId!: string;

  @ApiProperty({ description: 'ID de la sección (grado)' })
  @IsUUID()
  gradeSectionId!: string;

  @ApiProperty({ description: 'ID de la materia' })
  @IsUUID()
  subjectId!: string;

  @ApiProperty({ description: 'ID del año académico' })
  @IsUUID()
  academicYearId!: string;
}
