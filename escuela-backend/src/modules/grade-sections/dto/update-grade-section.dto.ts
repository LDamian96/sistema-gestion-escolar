import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateGradeSectionDto } from './create-grade-section.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGradeSectionDto extends PartialType(
  OmitType(CreateGradeSectionDto, ['schoolId', 'academicYearId'] as const),
) {
  @ApiPropertyOptional({ example: true, description: 'Estado activo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
