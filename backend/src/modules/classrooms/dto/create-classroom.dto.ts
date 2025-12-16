import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateClassroomDto {
  @ApiProperty({ description: 'ID de la sección a la que pertenece el aula' })
  @IsString()
  @IsNotEmpty()
  sectionId: string;

  @ApiProperty({ description: 'Nombre del aula', example: 'Aula 101' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Capacidad del aula', example: 30, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({ description: 'Ubicación del aula', example: 'Edificio A, Piso 1', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateClassroomDto extends PartialType(CreateClassroomDto) {}
