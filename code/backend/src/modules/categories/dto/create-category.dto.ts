import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';
export class CreateCategoryDto {
  @ApiProperty({
    example: 'Beverages',
    description: 'Name of the category (e.g., Beverages, Desserts)',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({
    example: 'Drinks and beverages',
    description: 'Short description displayed in the menu',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'description cannot exceed 255 characters' })
  description?: string;
}
