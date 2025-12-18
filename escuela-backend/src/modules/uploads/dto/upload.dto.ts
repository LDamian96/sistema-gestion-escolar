import { IsString, IsOptional, IsUUID, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateUploadDto {
  @ApiProperty({ description: 'Nombre del archivo' })
  @IsString()
  fileName!: string;

  @ApiProperty({ description: 'Nombre original del archivo' })
  @IsString()
  originalName!: string;

  @ApiProperty({ description: 'Tipo MIME' })
  @IsString()
  mimeType!: string;

  @ApiProperty({ description: 'Tamano en bytes' })
  @IsInt()
  size!: number;

  @ApiProperty({ description: 'URL del archivo' })
  @IsString()
  url!: string;

  @ApiProperty({ description: 'Ruta del archivo' })
  @IsString()
  path!: string;

  @ApiProperty({ description: 'ID de la escuela' })
  @IsUUID()
  schoolId!: string;
}

export class QueryUploadsDto {
  @ApiPropertyOptional({ description: 'ID de la escuela' })
  @IsUUID()
  @IsOptional()
  schoolId?: string;

  @ApiPropertyOptional({ description: 'ID del usuario' })
  @IsUUID()
  @IsOptional()
  uploadedById?: string;

  @ApiPropertyOptional({ description: 'Tipo MIME (parcial)' })
  @IsString()
  @IsOptional()
  mimeType?: string;

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
