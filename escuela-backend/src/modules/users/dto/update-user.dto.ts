import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'usuario@escuela.com', description: 'Email único del usuario' })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({ example: 'Juan', description: 'Nombre del usuario' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez', description: 'Apellido del usuario' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.STUDENT, description: 'Rol del usuario' })
  @IsOptional()
  @IsEnum(Role, { message: 'Rol inválido' })
  role?: Role;

  @ApiPropertyOptional({ example: 'uuid-de-la-escuela', description: 'ID de la escuela' })
  @IsOptional()
  @IsUUID('4', { message: 'ID de escuela inválido' })
  schoolId?: string;

  @ApiPropertyOptional({ example: '+51999888777', description: 'Teléfono del usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: true, description: 'Estado activo del usuario' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
