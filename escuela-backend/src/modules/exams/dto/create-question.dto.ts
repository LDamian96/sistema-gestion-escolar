import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ example: '¿Cuánto es 2 + 2?' })
  @IsString()
  @MinLength(3)
  question!: string;

  @ApiProperty({
    example: 'multiple_choice',
    description: 'Tipo: multiple_choice, true_false, short_answer, essay',
  })
  @IsString()
  type!: string;

  @ApiPropertyOptional({
    example: { a: '3', b: '4', c: '5', d: '6' },
    description: 'Opciones para multiple choice',
  })
  @IsOptional()
  @IsObject()
  options?: Record<string, string>;

  @ApiPropertyOptional({ example: 'b', description: 'Respuesta correcta' })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({ example: 2, description: 'Puntos de la pregunta' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(20)
  points?: number;

  @ApiPropertyOptional({ example: 1, description: 'Orden de la pregunta' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
