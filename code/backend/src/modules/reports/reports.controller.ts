import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponseDto } from '@common/dtos/api-response.dto';
import {
  MonthlyRevenueTrendDto,
  MonthlyTrendQueryDto,
  DateRangeQueryDto,
  ReportResponseDto,
  RevenueTrendItemDto,
  TopSellingItemDto,
  DateQueryDto,
} from './dtos/dtos';
import { Roles } from '@common/decorators';
import { Role } from '@common/enums';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Roles(Role.OWNER)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiResponse({ status: 200, type: ReportResponseDto })
  async getRevenueReport(@Query() query: DateRangeQueryDto): Promise<ApiResponseDto<ReportResponseDto>> {
    const ReportDto = await this.reportsService.getRevenueReport(query);
    return ApiResponseDto.success(ReportDto, 'Get revenue report success');
  }

  @Get('bestsellers')
  @ApiOperation({ summary: 'Get top 10 selling items' })
  async getTopSellingItems(@Query() query: DateRangeQueryDto): Promise<ApiResponseDto<TopSellingItemDto[]>> {
    const ReportDto = await this.reportsService.getTopSellingItems(query);
    return ApiResponseDto.success(ReportDto, 'Get top 10 selling items success');
  }

  @Get('revenue/trend/week')
  @ApiOperation({ summary: 'Get trend revenue during this week' })
  async getCurrentWeekRevenueTrend(@Query() query: DateQueryDto): Promise<ApiResponseDto<RevenueTrendItemDto[]>> {
    const ReportDto = await this.reportsService.getCurrentWeekRevenueTrend(query);
    return ApiResponseDto.success(ReportDto, 'Get trend revenue during this week success');
  }

  @Get('revenue/trend/month')
  @ApiOperation({ summary: 'Get trend revenue in month' })
  async getMonthRevenueTrend(@Query() query: MonthlyTrendQueryDto): Promise<ApiResponseDto<MonthlyRevenueTrendDto[]>> {
    const ReportDto = await this.reportsService.getMonthRevenueTrend(query);
    return ApiResponseDto.success(ReportDto, 'Get trend revenue in month success');
  }
}
