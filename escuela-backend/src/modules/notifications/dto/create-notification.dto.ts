import { IsString, IsEnum, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Nueva tarea asignada', description: 'Título de la notificación' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Se ha asignado una nueva tarea de Matemáticas', description: 'Mensaje de la notificación' })
  @IsString()
  message!: string;

  @ApiPropertyOptional({ enum: NotificationType, example: 'INFO', description: 'Tipo de notificación' })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ example: '/tareas/123', description: 'Link relacionado' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ description: 'Metadatos adicionales' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiProperty({ description: 'ID del usuario destinatario' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'ID de la escuela' })
  @IsUUID()
  schoolId!: string;
}
