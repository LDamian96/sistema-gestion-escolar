import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitTaskDto {
  @ApiPropertyOptional({ example: 'Mi respuesta a la tarea...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: ['tarea.pdf', 'imagen.jpg'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
