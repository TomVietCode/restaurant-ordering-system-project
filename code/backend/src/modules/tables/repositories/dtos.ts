import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { TableStatus } from "@common/enums.js";

export class CreateTableDto {
  @ApiProperty({
    description: 'Table name (must be unique)',
    example: 'Bàn 01',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Table name is required' })
  @IsString({ message: 'Table name must be a string' })
  @MaxLength(100, { message: 'Table name must be at most 100 characters long' })
  name: string;

  @ApiProperty({
    description: 'Seating capacity',
    example: 4,
    required: true,
  })
  @IsNotEmpty({ message: 'Capacity is required' })
  @IsInt({ message: 'Capacity must be an integer' })
  @Min(1, { message: 'Capacity must be greater than 0' })
  capacity: number;

  @ApiPropertyOptional({
    description: 'Initial table status (default: AVAILABLE)',
    enum: TableStatus,
    example: TableStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus = TableStatus.AVAILABLE;
}

export class UpdateTableDto extends PartialType(CreateTableDto) {}

export class TableResponseDto {
  @ApiProperty({ description: 'UUID of the table (used by frontend to generate QR)', example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ description: 'Table name', example: 'Bàn 01' })
  name: string;

  @ApiProperty({ description: 'Seating capacity', example: 4 })
  capacity: number;

  @ApiProperty({ description: 'Table status', enum: TableStatus, example: TableStatus.AVAILABLE })
  status: TableStatus;
}

