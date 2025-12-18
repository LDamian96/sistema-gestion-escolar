import { PartialType } from '@nestjs/swagger';
import { CreateCurriculumTopicDto } from './create-curriculum-topic.dto';

export class UpdateCurriculumTopicDto extends PartialType(
  CreateCurriculumTopicDto,
) {}
