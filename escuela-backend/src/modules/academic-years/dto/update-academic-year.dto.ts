import { PartialType } from '@nestjs/swagger';
import { CreateAcademicYearDto } from './create-academic-year.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateAcademicYearDto extends PartialType(CreateAcademicYearDto) {
  @IsOptional()
  @IsUUID()
  schoolId?: string;
}
