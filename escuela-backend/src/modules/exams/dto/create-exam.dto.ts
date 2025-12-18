import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExamDto {
  @ApiProperty({ example: 'Examen Parcial - Matemáticas' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Examen del primer bimestre' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'Leer cuidadosamente cada pregunta' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;

  @ApiPropertyOptional({ example: 60, description: 'Duración en minutos' })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(300)
  duration?: number;

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

  @ApiProperty({ example: '2024-12-15T09:00:00Z', description: 'Fecha/hora de inicio' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2024-12-15T10:00:00Z', description: 'Fecha/hora de fin' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: false, description: 'Publicar examen' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Mostrar resultados al finalizar' })
  @IsOptional()
  @IsBoolean()
  showResults?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Mezclar preguntas' })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @ApiProperty({ description: 'ID del curso' })
  @IsUUID()
  courseId!: string;

  @ApiProperty({ description: 'ID del profesor' })
  @IsUUID()
  teacherId!: string;
}
