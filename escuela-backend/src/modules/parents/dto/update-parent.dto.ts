import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateParentDto } from './create-parent.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateParentDto extends PartialType(
  OmitType(CreateParentDto, ['email', 'password', 'schoolId'] as const),
) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
