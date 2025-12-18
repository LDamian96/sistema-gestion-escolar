import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@escuela.com', description: 'Email único del usuario' })
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @ApiProperty({ example: 'Password123!', description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password!: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  firstName!: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario' })
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  lastName!: string;

  @ApiProperty({ enum: Role, example: Role.STUDENT, description: 'Rol del usuario' })
  @IsEnum(Role, { message: 'Rol inválido' })
  role!: Role;

  @ApiProperty({ example: 'uuid-de-la-escuela', description: 'ID de la escuela' })
  @IsUUID('4', { message: 'ID de escuela inválido' })
  schoolId!: string;

  @ApiPropertyOptional({ example: '+51999888777', description: 'Teléfono del usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
