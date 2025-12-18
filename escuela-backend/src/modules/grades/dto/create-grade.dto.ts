import { IsNumber, IsString, IsOptional, IsUUID, Min, Max, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({ example: 18.5, description: 'Valor numérico de la calificación (0-20)' })
  @IsNumber()
  @Min(0)
  @Max(20)
  value!: number;

  @ApiPropertyOptional({ example: 'A', description: 'Calificación en letra (AD, A, B, C)' })
  @IsOptional()
  @IsString()
  letter?: string;

  @ApiProperty({ example: 1, description: 'Período/Bimestre (1, 2, 3, 4)' })
  @IsNumber()
  @Min(1)
  @Max(4)
  period!: number;

  @ApiProperty({
    example: 'task',
    description: 'Tipo de calificación',
    enum: ['task', 'exam', 'participation', 'final']
  })
  @IsString()
  @IsIn(['task', 'exam', 'participation', 'final'])
  type!: string;

  @ApiPropertyOptional({ example: 'Excelente trabajo en el proyecto', description: 'Comentario del profesor' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'ID del estudiante' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'ID del curso' })
  @IsUUID()
  courseId!: string;
}
