import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString, IsNotEmpty, MaxLength, IsNumber, Min, IsOptional,
  IsArray, IsUrl, IsBoolean, IsInt,
  Max,
  IsIn,
} from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'Black Coffee', maxLength: 150 })
  @IsString()
  @IsNotEmpty({ message: 'Item name is required' })
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 30000, description: 'Price >= 0' })
  @IsNumber({}, { message: 'Price must be a valid number >= 0' })
  @Min(0, { message: 'Price must be a valid number >= 0' })
  price: number;

  @ApiProperty({ example: 1, description: 'ID of the category this item belongs to' })
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @ApiPropertyOptional({ example: 'Rich aromatic coffee', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: ['https://cdn.example.com/coffee.jpg'],
    description: 'Array of image URLs',
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  imagesUrl?: string[];

  @ApiPropertyOptional({ example: true, description: 'In-stock status, defaults to true' })
  @IsOptional()
  @IsBoolean()
  isRemain?: boolean;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}

export class ToggleAvailabilityDto {
  @ApiProperty({ example: false, description: 'true = In Stock, false = Out of Stock' })
  @IsBoolean()
  isRemain: boolean;
}

export class QueryItemsDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ example: 'coffee', description: 'Search by item name (ILIKE)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by category ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ example: 'price', enum: ['price', 'name', 'createdAt'] })
  @IsOptional()
  @IsIn(['price', 'name', 'createdAt'])
  sortBy?: 'price' | 'name' | 'createdAt';

  @ApiPropertyOptional({ example: 'ASC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
