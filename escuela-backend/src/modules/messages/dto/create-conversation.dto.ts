import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ParticipantRole } from '@prisma/client';

export class ParticipantDto {
  @ApiProperty({ description: 'Rol del participante', enum: ParticipantRole })
  @IsEnum(ParticipantRole)
  role!: ParticipantRole;

  @ApiPropertyOptional({ description: 'ID del profesor (si es TEACHER)' })
  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @ApiPropertyOptional({ description: 'ID del padre (si es PARENT)' })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class CreateConversationDto {
  @ApiPropertyOptional({ description: 'ID del estudiante relacionado' })
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Nombre del estudiante' })
  @IsString()
  @IsOptional()
  studentName?: string;

  @ApiPropertyOptional({ description: 'Seccion del grado' })
  @IsString()
  @IsOptional()
  gradeSection?: string;

  @ApiProperty({
    description: 'Lista de participantes',
    type: [ParticipantDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants!: ParticipantDto[];

  @ApiPropertyOptional({ description: 'Mensaje inicial' })
  @IsString()
  @IsOptional()
  initialMessage?: string;
}
