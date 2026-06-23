import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateTableDto {
  @ApiPropertyOptional({
    description: 'Table name (must be unique)',
    example: 'Bàn 01',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Table name is required' })
  @IsString({ message: 'Table name must be a string' })
  @MaxLength(100, { message: 'Table name must be at most 100 characters long' })
  name: string;

  @ApiProperty({
    description: 'Seating capacity (optional)',
    example: 4,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Capacity must be an integer' })
  @Min(1, { message: 'Capacity must be greater than 0' })
  capacity?: number;

  @ApiProperty({
    description: 'Whether the table is currently free (default: true)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;
}

export class UpdateTableDto extends PartialType(CreateTableDto) {}

export class TableResponseDto {
  @ApiProperty({ description: 'UUID of the table (used by frontend to generate QR)', example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ description: 'Table name', example: 'Bàn 01' })
  name: string;

  @ApiProperty({ description: 'Seating capacity', example: 4, nullable: true })
  capacity: number | null;

  @ApiProperty({ description: 'Whether the table is currently free', example: true })
  isAvailable: boolean;
}
