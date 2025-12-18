import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParentDto {
  // Datos del Usuario
  @ApiProperty({ example: 'padre@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Roberto' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({ example: 'Pérez Mendoza' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({ example: '+51999888777' })
  @IsOptional()
  @IsString()
  phone?: string;

  // Datos del Padre
  @ApiPropertyOptional({ example: '12345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  dni?: string;

  @ApiPropertyOptional({ example: 'Ingeniero' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @ApiPropertyOptional({ example: '+51999666555' })
  @IsOptional()
  @IsString()
  workPhone?: string;

  @ApiPropertyOptional({ example: 'Av. Industrial 789' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  workAddress?: string;

  @ApiPropertyOptional({ example: 'Padre', description: 'Padre, Madre, Tutor, etc.' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  relationship?: string;

  @ApiProperty({ description: 'ID de la escuela' })
  @IsUUID()
  schoolId!: string;

  @ApiPropertyOptional({ description: 'IDs de los hijos a asignar', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];
}
