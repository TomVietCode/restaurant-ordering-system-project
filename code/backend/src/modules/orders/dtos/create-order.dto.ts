import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString, IsNotEmpty, IsUUID, IsArray, ValidateNested,
  IsInt, Min, IsOptional, MaxLength, ArrayMinSize,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, description: 'Menu item ID' })
  @IsInt()
  @IsNotEmpty()
  itemId: number;

  @ApiProperty({ example: 2, description: 'Quantity (must be >= 1)' })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @ApiPropertyOptional({ example: 'Less ice, more sugar', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Table UUID from QR code' })
  @IsUUID()
  @IsNotEmpty()
  tableId: string;

  @ApiProperty({ type: [CreateOrderItemDto], description: 'List of items to order' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Order must have at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
