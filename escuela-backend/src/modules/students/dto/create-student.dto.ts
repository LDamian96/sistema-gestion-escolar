import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class CreateStudentDto {
  // Datos del Usuario
  @ApiProperty({ example: 'estudiante@escuela.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({ example: 'Pérez García' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({ example: '+51999888777' })
  @IsOptional()
  @IsString()
  phone?: string;

  // Datos del Estudiante
  @ApiProperty({ example: 'EST-2024-001' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  studentCode!: string;

  @ApiPropertyOptional({ example: '12345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  dni?: string;

  @ApiPropertyOptional({ example: '2010-05-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ enum: Gender, example: 'MALE' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'Av. Los Olivos 123' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ example: '+51999777666' })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodType?: string;

  @ApiPropertyOptional({ example: 'Alergia al maní' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({ example: 'Usa lentes' })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @ApiProperty({ description: 'ID de la escuela' })
  @IsUUID()
  schoolId!: string;

  @ApiPropertyOptional({ description: 'ID de la sección (grado)' })
  @IsOptional()
  @IsUUID()
  gradeSectionId?: string;

  @ApiPropertyOptional({ description: 'IDs de los padres a asignar', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  parentIds?: string[];
}
