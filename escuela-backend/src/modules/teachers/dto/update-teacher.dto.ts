import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeacherDto extends PartialType(
  OmitType(CreateTeacherDto, ['email', 'password', 'schoolId'] as const),
) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
