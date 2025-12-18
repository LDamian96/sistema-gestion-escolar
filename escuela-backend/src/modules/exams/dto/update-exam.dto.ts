import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateExamDto } from './create-exam.dto';

export class UpdateExamDto extends PartialType(
  OmitType(CreateExamDto, ['courseId', 'teacherId'] as const),
) {}
