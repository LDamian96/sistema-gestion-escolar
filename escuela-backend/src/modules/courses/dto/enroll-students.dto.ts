import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollStudentsDto {
  @ApiProperty({ description: 'IDs de los estudiantes a matricular', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds!: string[];
}
