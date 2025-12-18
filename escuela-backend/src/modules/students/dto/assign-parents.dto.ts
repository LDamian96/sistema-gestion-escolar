import { IsArray, IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignParentDto {
  @ApiProperty({ description: 'ID del padre' })
  @IsUUID()
  parentId!: string;

  @ApiPropertyOptional({ description: 'Es contacto principal', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class AssignParentsDto {
  @ApiProperty({ type: [AssignParentDto] })
  @IsArray()
  parents!: AssignParentDto[];
}
