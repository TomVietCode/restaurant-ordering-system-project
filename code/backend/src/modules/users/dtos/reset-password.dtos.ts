import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsBoolean, IsNumber, IsIn } from 'class-validator';
import { Role } from '@common/enums.js';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class changePasswordDto {
  @ApiProperty({
    description: 'Old password of the user',
    example: 'strongPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty({
    description: 'New password of the user',
    example: 'newstrongPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    description: 'New password of the user',
    example: 'newstrongPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
