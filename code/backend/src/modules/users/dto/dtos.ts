import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '@common/enums.js';
import { ApiProperty, ApiPropertyOptional } from 'node_modules/@nestjs/swagger/dist/decorators/api-property.decorator';
import { PartialType } from 'node_modules/@nestjs/swagger/dist/type-helpers/partial-type.helper';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email of the user (must be unique)',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password of the user (will be hashed in the service)',
    example: 'strongPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    enum: Role,
    example: Role.STAFF,
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user (optional)',
    example: '0912345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserResponseDto {
  @ApiProperty({ description: 'Number Id of user', example: '1' })
  id: number;

  @ApiProperty({ description: 'Email of the user', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Role of the user', example: 'staff' })
  role: Role;

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  fullName: string;

  @ApiPropertyOptional({ description: 'Phone number of the user (optional)', example: '+1234567890' })
  phone?: string;

  @ApiProperty({ description: 'Indicates if the user is active', example: true })
  isActive: boolean;
}

export class ChangePasswordDto {
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
    example: 'newPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password of the user',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  confirmNewPassword: string;
}