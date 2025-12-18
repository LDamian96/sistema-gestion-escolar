import { IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsEnum, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ParticipantRole, AttachmentType } from '@prisma/client';

export class AttachmentDto {
  @ApiProperty({ description: 'Nombre del archivo' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Tipo de adjunto', enum: AttachmentType })
  @IsEnum(AttachmentType)
  type!: AttachmentType;

  @ApiProperty({ description: 'URL del archivo' })
  @IsString()
  url!: string;

  @ApiProperty({ description: 'Tamano en bytes' })
  @IsInt()
  size!: number;
}

export class CreateMessageDto {
  @ApiProperty({ description: 'ID de la conversacion' })
  @IsUUID()
  conversationId!: string;

  @ApiProperty({ description: 'Contenido del mensaje' })
  @IsString()
  content!: string;

  @ApiProperty({ description: 'Nombre del remitente' })
  @IsString()
  senderName!: string;

  @ApiProperty({ description: 'Rol del remitente', enum: ParticipantRole })
  @IsEnum(ParticipantRole)
  senderRole!: ParticipantRole;

  @ApiPropertyOptional({
    description: 'Archivos adjuntos',
    type: [AttachmentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];
}
