import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'ID de la pregunta' })
  @IsUUID()
  questionId!: string;

  @ApiProperty({ example: 'b', description: 'Respuesta del estudiante' })
  @IsString()
  answer!: string;
}
