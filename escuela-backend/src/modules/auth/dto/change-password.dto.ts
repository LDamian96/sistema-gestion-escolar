import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Contraseña actual',
  })
  @IsString()
  @MinLength(6)
  currentPassword!: string;

  @ApiProperty({
    example: 'newPassword123!',
    description: 'Nueva contraseña',
  })
  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  newPassword!: string;

  @ApiProperty({
    example: 'newPassword123!',
    description: 'Confirmación de nueva contraseña',
  })
  @IsString()
  confirmPassword!: string;
}
