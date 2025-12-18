import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'ID del estudiante' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'ID del curso' })
  @IsUUID()
  courseId!: string;
}
