import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  IsUUID,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurriculumStatus } from '@prisma/client';

export class CreateCurriculumTopicDto {
  @ApiProperty({ description: 'Numero de unidad', example: 1 })
  @IsInt()
  @Min(1)
  @Max(12)
  unit!: number;

  @ApiProperty({ description: 'Titulo del tema', example: 'Numeros naturales' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Descripcion del tema' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Objetivos de aprendizaje',
    example: ['Identificar numeros', 'Comparar cantidades'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  objectives?: string[];

  @ApiPropertyOptional({ description: 'Horas estimadas', default: 2 })
  @IsInt()
  @IsOptional()
  @Min(1)
  estimatedHours?: number;

  @ApiProperty({ description: 'Mes (1-12)', example: 3 })
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiPropertyOptional({
    description: 'Estado del tema',
    enum: CurriculumStatus,
    default: 'PLANNED',
  })
  @IsEnum(CurriculumStatus)
  @IsOptional()
  status?: CurriculumStatus;

  @ApiPropertyOptional({ description: 'URL de material adjunto' })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: 'Nombre del archivo adjunto' })
  @IsString()
  @IsOptional()
  attachmentName?: string;

  @ApiProperty({ description: 'ID del curso' })
  @IsUUID()
  courseId!: string;

  @ApiProperty({ description: 'ID del profesor' })
  @IsUUID()
  teacherId!: string;
}
