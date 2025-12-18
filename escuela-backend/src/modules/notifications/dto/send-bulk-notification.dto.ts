import { IsString, IsEnum, IsOptional, IsArray, IsUUID, IsObject, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, Role } from '@prisma/client';

export class SendBulkNotificationDto {
  @ApiProperty({ example: 'Aviso importante', description: 'Título de la notificación' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Se informa a todos los padres...', description: 'Mensaje de la notificación' })
  @IsString()
  message!: string;

  @ApiPropertyOptional({ enum: NotificationType, example: 'INFO', description: 'Tipo de notificación' })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ example: '/avisos/123', description: 'Link relacionado' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ description: 'Metadatos adicionales' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiProperty({ description: 'ID de la escuela' })
  @IsUUID()
  schoolId!: string;

  @ApiPropertyOptional({
    description: 'Roles a los que enviar (si no se especifica, se envía a todos)',
    enum: Role,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @ApiPropertyOptional({
    description: 'IDs de usuarios específicos (alternativa a roles)',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  userIds?: string[];
}
