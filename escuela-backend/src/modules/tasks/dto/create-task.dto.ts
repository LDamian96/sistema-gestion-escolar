import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType, SubmissionType } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Tarea de Matemáticas - Fracciones' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Resolver los ejercicios del capítulo 5' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'Mostrar el procedimiento completo' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;

  @ApiPropertyOptional({ enum: TaskType, default: 'HOMEWORK' })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @ApiPropertyOptional({ enum: SubmissionType, default: 'DIGITAL' })
  @IsOptional()
  @IsEnum(SubmissionType)
  submissionType?: SubmissionType;

  @ApiPropertyOptional({ example: 20, description: 'Puntaje máximo' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxScore?: number;

  @ApiPropertyOptional({ example: 1, description: 'Peso en calificación final' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10)
  weight?: number;

  @ApiProperty({ example: '2024-12-20T23:59:00Z', description: 'Fecha límite' })
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional({ example: true, description: 'Permitir entregas tardías' })
  @IsOptional()
  @IsBoolean()
  allowLate?: boolean;

  @ApiPropertyOptional({ example: 10, description: '% de penalización por entrega tardía' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  latePenalty?: number;

  @ApiPropertyOptional({ example: ['archivo1.pdf'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ example: false, description: 'Publicar tarea' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ description: 'ID del curso' })
  @IsUUID()
  courseId!: string;

  @ApiProperty({ description: 'ID del profesor' })
  @IsUUID()
  teacherId!: string;
}
