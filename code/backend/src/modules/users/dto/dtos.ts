import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsBoolean, IsNumber } from 'class-validator';
import { Role } from '@common/enums.js';
import { ApiProperty, ApiPropertyOptional } from 'node_modules/@nestjs/swagger/dist/decorators/api-property.decorator';
import { Type } from 'class-transformer';
import { User } from '../entities/user.entity';

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

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Email of the user (must be unique)',
    example: 'user@example.com',
  })
  
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Role of the user in the system',
    enum: Role,
    example: Role.STAFF,
  
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user (optional)',
    example: '0912345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

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

export class UserQueryDto {
  @ApiPropertyOptional({ description: 'Search by username or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Filter by role' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort by field', enum: Object.keys(new User()) })
  @IsOptional()
  @IsString()
  sortBy?: keyof User;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
