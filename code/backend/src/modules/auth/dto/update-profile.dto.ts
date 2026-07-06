import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Full name cannot be empty' })
  @MaxLength(100, { message: 'Full name cannot exceed 100 characters' })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '0912345678',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;
}
