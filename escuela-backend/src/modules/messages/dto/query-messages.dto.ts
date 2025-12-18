import { IsOptional, IsUUID, IsInt, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class QueryConversationsDto {
  @ApiPropertyOptional({ description: 'ID del curso' })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Solo conversaciones no leídas' })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  unreadOnly?: boolean;

  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Límite por página', default: 20 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}

export class QueryMessagesDto {
  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Límite por página', default: 50 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
