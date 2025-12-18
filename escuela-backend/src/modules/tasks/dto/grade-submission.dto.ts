import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GradeSubmissionDto {
  @ApiProperty({ example: 18, description: 'Calificación obtenida' })
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @ApiPropertyOptional({ example: 'Buen trabajo, mejorar la presentación' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
