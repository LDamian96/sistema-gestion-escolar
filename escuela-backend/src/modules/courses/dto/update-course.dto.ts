import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseDto extends PartialType(
  OmitType(CreateCourseDto, ['gradeSectionId', 'subjectId', 'academicYearId'] as const),
) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
