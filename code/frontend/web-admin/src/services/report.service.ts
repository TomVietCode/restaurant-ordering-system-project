import { apiWithToken } from '@/lib/api';
import type {
  RevenueReport,
  RevenueTrendItem,
  MonthlyRevenueTrend,
  TopSellingItem,
} from '@/types/report';

// ──────────────────────────────────────────────────────────────
// Backend envelope types
// ──────────────────────────────────────────────────────────────

/** Standard API response wrapper used by all report endpoints. */
interface ApiRes<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ──────────────────────────────────────────────────────────────
// Service — calls backend /reports/* endpoints
// ──────────────────────────────────────────────────────────────

export const reportService = {
  /**
   * GET /reports/revenue?start=...&end=...
   * Returns total revenue and total orders for the given date range.
   */
  async getRevenue(start: string, end: string, token?: string | null): Promise<RevenueReport> {
    const res = await apiWithToken(token).get<ApiRes<RevenueReport>>(
      `/reports/revenue?start=${start}&end=${end}`,
    );
    return res.data;
  },

  /**
   * GET /reports/bestsellers?start=...&end=...
   * Returns top 10 best-selling items ranked by quantity.
   */
  async getBestsellers(start: string, end: string, token?: string | null): Promise<TopSellingItem[]> {
    const res = await apiWithToken(token).get<ApiRes<TopSellingItem[]>>(
      `/reports/bestsellers?start=${start}&end=${end}`,
    );
    return res.data;
  },

  /**
   * GET /reports/revenue/trend/week?anchor=...
   * Returns daily revenue for the 7 days ending on the anchor date (inclusive).
   */
  async getDailyTrend(anchor?: string, token?: string | null): Promise<RevenueTrendItem[]> {
    const query = anchor ? `?anchor=${anchor}` : '';
    const res = await apiWithToken(token).get<ApiRes<RevenueTrendItem[]>>(
      `/reports/revenue/trend/week${query}`,
    );
    return res.data;
  },

  /**
   * GET /reports/revenue/trend/month?start=...&end=...
   * Returns weekly revenue aggregates spanning the given date range
   * (expanded to full Monday–Sunday weeks).
   */
  async getMonthTrend(start: string, end: string, token?: string | null): Promise<MonthlyRevenueTrend[]> {
    const res = await apiWithToken(token).get<ApiRes<MonthlyRevenueTrend[]>>(
      `/reports/revenue/trend/month?start=${start}&end=${end}`,
    );
    return res.data;
  },
};
