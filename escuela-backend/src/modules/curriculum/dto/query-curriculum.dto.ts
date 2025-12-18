import { IsOptional, IsUUID, IsInt, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CurriculumStatus } from '@prisma/client';

export class QueryCurriculumDto {
  @ApiPropertyOptional({ description: 'ID del curso' })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: 'ID del profesor' })
  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @ApiPropertyOptional({ description: 'Mes (1-12)' })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  month?: number;

  @ApiPropertyOptional({ description: 'Unidad' })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  unit?: number;

  @ApiPropertyOptional({ description: 'Estado', enum: CurriculumStatus })
  @IsEnum(CurriculumStatus)
  @IsOptional()
  status?: CurriculumStatus;

  @ApiPropertyOptional({ description: 'Pagina', default: 1 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Limite por pagina', default: 20 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}

export class CreateMonthlyTopicDto {
  @ApiProperty({ description: 'Fecha' })
  @IsDateString()
  date!: string;

  @ApiProperty({ description: 'Mes (1-12)' })
  @IsInt()
  @Type(() => Number)
  month!: number;

  @ApiProperty({ description: 'Ano' })
  @IsInt()
  @Type(() => Number)
  year!: number;

  @ApiProperty({ description: 'Titulo' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Descripcion' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'URL de adjunto' })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: 'Nombre de adjunto' })
  @IsString()
  @IsOptional()
  attachmentName?: string;

  @ApiPropertyOptional({ description: 'ID del tema curricular' })
  @IsUUID()
  @IsOptional()
  curriculumTopicId?: string;

  @ApiProperty({ description: 'ID del curso' })
  @IsUUID()
  courseId!: string;

  @ApiProperty({ description: 'ID del profesor' })
  @IsUUID()
  teacherId!: string;
}
