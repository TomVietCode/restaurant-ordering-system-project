import { formatDate, getStartOfToday, getStartOfTomorrow } from '@common/helpers/date';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Max, Min } from 'class-validator';

export class DateQueryDto{
  @ApiProperty({
    description: 'Start date of the reporting period',
    example: formatDate(getStartOfToday()),
    required: false,
    format: 'date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start: Date = getStartOfToday();
}

export class DateRangeQueryDto {
  @ApiProperty({
    description: 'Start date of the reporting period',
    example: '2026-01-01',
    required: false,
    format: 'date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start: Date = getStartOfToday();

  @ApiPropertyOptional({
    description: 'End date of the reporting period.',
    example: '2026-08-30',
    required: false,
    format: 'date',
  })
  @Type(() => Date)
  @IsDate({ message: 'from must be a valid date (YYYY-MM-DD)' })
  @IsOptional()
  end: Date = getStartOfTomorrow();
}

export class ReportResponseDto {
  @ApiProperty({
    description: 'Start date of the reporting period',
    example: '2026-01-01',
    format: 'date',
  })
  start!: string;

  @ApiProperty({
    description: 'End date of the reporting period',
    example: '2026-08-30',
    type: String,
    format: 'date',
  })
  end!: string;

  @ApiProperty({
    description: 'Total revenue generated during the reporting period',
    example: 125000000,
  })
  totalRevenue!: number;

  @ApiProperty({
    description: 'Total number of completed orders during the reporting period',
    example: 186,
  })
  totalOrders!: number;
}
export interface TopSellingItem {
  itemId: number;
  itemName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export class TopSellingItemDto {
  @ApiProperty({
    description: 'Id of item',
    example: 2,
  })
  itemId!: number;
  @ApiProperty({
    description: 'Name of item',
    example: "food",
  })
  itemName!: string;
  @ApiProperty({
    description: 'Number of products sold',
    example: 12,
  })
  totalQuantity!: number;
  
  @ApiProperty({
    description: 'Total revenue from products sold',
    example: 12,
  })
  totalRevenue!: number;
}

export class RevenueTrendItemDto {
  @ApiProperty({
    description: 'Revenue date',
    example: '2026-06-27',
  })
  date!: string;
  
  @ApiProperty({
    description: 'Total revenue of the day',
    example: 12500000,
  })
  revenue!: number;
}

export class MonthlyTrendQueryDto {
  @ApiPropertyOptional({ example: getStartOfToday().getFullYear(), default: getStartOfToday().getFullYear() })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year: number = getStartOfToday().getFullYear();

  @ApiPropertyOptional({ example: getStartOfToday().getMonth() + 1, default: getStartOfToday().getMonth() + 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number = getStartOfToday().getMonth() + 1;
}

export class MonthlyRevenueTrendDto {
  @ApiProperty({
    example: '2026-06-01',
    description: 'First day of the week',
  })
  weekStart!: string;

  @ApiProperty({
    example: '2026-06-08',
    description: 'Exclusive end of the week',
  })
  weekEnd!: string;

  @ApiProperty({
    example: 12500000,
    description: 'Total revenue of the week',
  })
  totalRevenue!: number;

  @ApiProperty({
    example: 132,
    description: 'Number of paid orders in the week',
  })
  totalOrders!: number;
}
