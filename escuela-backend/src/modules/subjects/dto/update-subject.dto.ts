import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSubjectDto } from './create-subject.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubjectDto extends PartialType(
  OmitType(CreateSubjectDto, ['schoolId'] as const),
) {
  @ApiPropertyOptional({ example: true, description: 'Estado activo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
