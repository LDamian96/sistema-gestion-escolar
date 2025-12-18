import { IsString, IsOptional, IsUUID, IsBoolean, IsInt, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';

export class CreateAuditLogDto {
  @ApiProperty({ enum: AuditAction, description: 'Tipo de acción' })
  @IsEnum(AuditAction)
  action!: AuditAction;

  @ApiProperty({ description: 'Recurso afectado (User, Student, Task, etc.)' })
  @IsString()
  resource!: string;

  @ApiPropertyOptional({ description: 'ID del recurso afectado' })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ description: 'Datos anteriores (para UPDATE/DELETE)' })
  @IsOptional()
  @IsObject()
  oldData?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Datos nuevos (para CREATE/UPDATE)' })
  @IsOptional()
  @IsObject()
  newData?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Dirección IP del cliente' })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({ description: 'User Agent del navegador' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Duración de la operación en ms' })
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiPropertyOptional({ description: 'Si la operación fue exitosa', default: true })
  @IsOptional()
  @IsBoolean()
  success?: boolean;

  @ApiPropertyOptional({ description: 'Mensaje de error si falló' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'ID del usuario que realizó la acción' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'ID de la escuela' })
  @IsUUID()
  schoolId!: string;
}
