import { IsString, IsOptional, IsUUID, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Matemáticas', description: 'Nombre de la materia' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'MAT', description: 'Código único de la materia' })
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  @Matches(/^[A-Z0-9]+$/, { message: 'El código debe ser alfanumérico en mayúsculas' })
  code!: string;

  @ApiPropertyOptional({ example: 'Curso de matemáticas básicas', description: 'Descripción' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '#3498db', description: 'Color para UI (hex)' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe ser un código hex válido' })
  color?: string;

  @ApiProperty({ description: 'ID de la escuela' })
  @IsUUID()
  schoolId!: string;
}
