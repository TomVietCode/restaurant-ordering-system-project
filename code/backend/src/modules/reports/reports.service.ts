import { Inject, Injectable } from '@nestjs/common';
import type { IReportRepository } from './repositories/report.repository.interface.js';
import {
  MonthlyRevenueTrendDto,
  MonthlyTrendQueryDto,
  DateRangeQueryDto,
  DateQueryDto,
  ReportResponseDto,
  RevenueTrendItemDto,
  TopSellingItemDto,
} from './dtos/dtos.js';
import { REPORT_REPOSITORY } from '@common/constants.js';
import { checkDate, formatDate } from '@common/helpers/date.js';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: IReportRepository,
  ) {}

  async getRevenueReport(query: DateRangeQueryDto): Promise<ReportResponseDto> {
    const { start, end } = query;
    checkDate(start, end);

    const { totalRevenue, totalOrders } = await this.reportRepository.getReportBetween(start, end);
    return {
      start: formatDate(start),
      end: formatDate(end),
      totalRevenue,
      totalOrders,
    };
  }

  async getTopSellingItems(query: DateRangeQueryDto): Promise<TopSellingItemDto[]> {
    const { start, end } = query;
    checkDate(start, end);

    const result = await this.reportRepository.getTopSellingItems(start, end);
    return result.map((item) => ({
      itemId: item.itemId,
      itemName: item.itemName,
      totalQuantity: Number(item.totalQuantity),
      totalRevenue: Number(item.totalRevenue),
    }));
  }

  async getCurrentWeekRevenueTrend(query: DateQueryDto): Promise<RevenueTrendItemDto[]> {
    const { start, end } = this.getCurrentWeekRange(query.start);
    const revenuePerWeek = await this.reportRepository.getCurrentWeekRevenueTrend(start, end);

    const mapRevenuePerWeek = new Map(revenuePerWeek.map((t) => [formatDate(new Date(t.date)), { revenue: Number(t.revenue) }]));
    const result: RevenueTrendItemDto[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const key = formatDate(new Date(date));

      result.push({
        date: key,
        revenue: mapRevenuePerWeek.get(key)?.revenue ?? 0,
      });
    }

    return result;
  }

  async getMonthRevenueTrend(query: MonthlyTrendQueryDto): Promise<MonthlyRevenueTrendDto[]> {
    const { year, month } = query;

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // Expand to full weeks covering the month boundaries
    const start = new Date(firstDay);
    const firstDayOfWeek = start.getDay();
    const diffToMonday = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    start.setDate(start.getDate() + diffToMonday);

    const end = new Date(lastDay);
    const lastDayOfWeek = end.getDay();
    const diffToSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    end.setDate(end.getDate() + diffToSunday);

    // Single query — aggregates all weeks at once
    const rows = await this.reportRepository.getMonthlyWeeklyTrend(start, end);
    const revenueMap = new Map(rows.map((r) => [r.weekStart, r]));

    const result: MonthlyRevenueTrendDto[] = [];
    const currentStart = new Date(start);

    while (currentStart <= end) {
      const currentEnd = new Date(currentStart);
      currentEnd.setDate(currentEnd.getDate() + 6);

      const key = formatDate(currentStart);
      const row = revenueMap.get(key);

      result.push({
        weekStart: formatDate(currentStart),
        weekEnd: formatDate(currentEnd),
        totalRevenue: Number(row?.totalRevenue ?? 0),
        totalOrders: Number(row?.totalOrders ?? 0),
      });

      currentStart.setDate(currentStart.getDate() + 7);
    }

    return result;
  }

  private getCurrentWeekRange(date: Date): { start: Date; end: Date } {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    start.setDate(start.getDate() + diff);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return { start, end };
  }
}
