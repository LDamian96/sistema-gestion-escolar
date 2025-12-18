import { IsArray, IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignChildDto {
  @ApiProperty({ description: 'ID del estudiante (hijo)' })
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({ description: 'Es contacto principal para este hijo', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class AssignChildrenDto {
  @ApiProperty({ type: [AssignChildDto] })
  @IsArray()
  children!: AssignChildDto[];
}
