import { IsString, IsOptional, IsEmail, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSchoolDto {
  @ApiProperty({ example: 'Colegio San Martín', description: 'Nombre de la escuela' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  name!: string;

  @ApiProperty({ example: 'CSM-001', description: 'Código único de la escuela' })
  @IsString()
  @MinLength(3, { message: 'El código debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El código no puede exceder 20 caracteres' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  code!: string;

  @ApiPropertyOptional({ example: 'Av. Principal 123', description: 'Dirección de la escuela' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ example: '+51 999 888 777', description: 'Teléfono de la escuela' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'info@escuela.com', description: 'Email de la escuela' })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({ description: 'URL del logo de la escuela' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;
}
