import { IsNumber, IsString, IsOptional, Min, Max, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGradeDto {
  @ApiPropertyOptional({ example: 19.0, description: 'Valor numérico de la calificación (0-20)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  value?: number;

  @ApiPropertyOptional({ example: 'AD', description: 'Calificación en letra (AD, A, B, C)' })
  @IsOptional()
  @IsString()
  letter?: string;

  @ApiPropertyOptional({ example: 2, description: 'Período/Bimestre (1, 2, 3, 4)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  period?: number;

  @ApiPropertyOptional({
    example: 'exam',
    description: 'Tipo de calificación',
    enum: ['task', 'exam', 'participation', 'final']
  })
  @IsOptional()
  @IsString()
  @IsIn(['task', 'exam', 'participation', 'final'])
  type?: string;

  @ApiPropertyOptional({ example: 'Mejoró respecto a la evaluación anterior', description: 'Comentario del profesor' })
  @IsOptional()
  @IsString()
  comment?: string;
}
