import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OldPasswordDto {
  @ApiProperty({
    description: 'Old password of the user',
    example: 'strongPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  oldPassword: string;
}

export class NewPasswordAndOtpDto {
  @ApiProperty({
    description: 'OTP code user needs to change/reset password',
    example: '123456',
  })
  @Matches(/^[0-9]{6}$/, {
    message: 'Invalid OTP format. Must be 6 digits.',
  })
  otp: string;

  @ApiProperty({
    description: 'New password of the user',
    example: 'newstrongPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class EmailDto{
  @ApiProperty({
    description: 'Email whose forget password',
    example: '123@gmail.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}
