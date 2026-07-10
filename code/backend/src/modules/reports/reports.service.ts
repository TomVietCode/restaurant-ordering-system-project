import { Inject, Injectable } from '@nestjs/common';
import type { IReportRepository } from './repositories/report.repository.interface.js';
import {
  MonthlyRevenueTrendDto,
  DateRangeQueryDto,
  DateQueryDto,
  ReportResponseDto,
  RevenueTrendItemDto,
  TopSellingItemDto,
} from './dtos/dtos.js';
import { REPORT_REPOSITORY } from '@common/constants.js';
import { addDays, checkDate, formatDate, startOfDay, startOfWeekMonday } from '@common/helpers/date.js';

/** Number of days shown in the daily ("Ngày") trend, ending on the anchor date. */
const DAILY_TREND_DAYS = 7;

@Injectable()
export class ReportsService {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: IReportRepository,
  ) {}

  async getRevenueReport(query: DateRangeQueryDto): Promise<ReportResponseDto> {
    const { start, end } = query;
    checkDate(start, end);

    const rangeStart = startOfDay(start);
    // Half-open interval: end is inclusive of its whole day, so query up to the
    // start of the day *after* end. Without this, a same-day range (Hôm nay) or
    // any range ending "today" would drop the final day entirely.
    const rangeEndExclusive = addDays(startOfDay(end), 1);

    const { totalRevenue, totalOrders } = await this.reportRepository.getReportBetween(rangeStart, rangeEndExclusive);
    return {
      start: formatDate(rangeStart),
      end: formatDate(startOfDay(end)),
      totalRevenue,
      totalOrders,
    };
  }

  async getTopSellingItems(query: DateRangeQueryDto): Promise<TopSellingItemDto[]> {
    const { start, end } = query;
    checkDate(start, end);

    const rangeStart = startOfDay(start);
    const rangeEndExclusive = addDays(startOfDay(end), 1);

    const result = await this.reportRepository.getTopSellingItems(rangeStart, rangeEndExclusive);
    return result.map((item) => ({
      itemId: item.itemId,
      itemName: item.itemName,
      totalQuantity: Number(item.totalQuantity),
      totalRevenue: Number(item.totalRevenue),
    }));
  }

  /**
   * Daily ("Ngày") trend: revenue for the {@link DAILY_TREND_DAYS}-day window
   * ending on the anchor date (inclusive) — e.g. anchor = today returns the last
   * 7 days including today. Days with no paid orders are filled with 0.
   */
  async getCurrentWeekRevenueTrend(query: DateQueryDto): Promise<RevenueTrendItemDto[]> {
    const lastDay = startOfDay(query.anchor);
    const firstDay = addDays(lastDay, -(DAILY_TREND_DAYS - 1));
    const endExclusive = addDays(lastDay, 1);

    const dailyRevenue = await this.reportRepository.getCurrentWeekRevenueTrend(firstDay, endExclusive);
    const revenueByDay = new Map(dailyRevenue.map((t) => [formatDate(new Date(t.date)), Number(t.revenue)]));

    const result: RevenueTrendItemDto[] = [];
    for (let i = 0; i < DAILY_TREND_DAYS; i++) {
      const key = formatDate(addDays(firstDay, i));
      result.push({ date: key, revenue: revenueByDay.get(key) ?? 0 });
    }

    return result;
  }

  /**
   * Monthly ("Tháng") trend: weekly revenue aggregates spanning the [start, end]
   * range. The range is expanded to full Monday–Sunday weeks so every bucket is a
   * complete week; empty weeks are filled with 0. Works for an arbitrary span
   * (a calendar month, the last 30 days, etc.).
   */
  async getMonthRevenueTrend(query: DateRangeQueryDto): Promise<MonthlyRevenueTrendDto[]> {
    const { start, end } = query;
    checkDate(start, end);

    // Expand to full weeks covering the range boundaries.
    const firstWeekStart = startOfWeekMonday(start);
    const lastWeekStart = startOfWeekMonday(end);
    const endExclusive = addDays(lastWeekStart, 7);

    // Single query — aggregates all weeks at once.
    const rows = await this.reportRepository.getMonthlyWeeklyTrend(firstWeekStart, endExclusive);
    const revenueMap = new Map(rows.map((r) => [r.weekStart, r]));

    const result: MonthlyRevenueTrendDto[] = [];
    let currentStart = firstWeekStart;

    while (currentStart <= lastWeekStart) {
      const key = formatDate(currentStart);
      const row = revenueMap.get(key);

      result.push({
        weekStart: key,
        weekEnd: formatDate(addDays(currentStart, 6)),
        totalRevenue: Number(row?.totalRevenue ?? 0),
        totalOrders: Number(row?.totalOrders ?? 0),
      });

      currentStart = addDays(currentStart, 7);
    }

    return result;
  }
}
