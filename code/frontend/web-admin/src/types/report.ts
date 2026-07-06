/**
 * TypeScript types for the Revenue Report API responses.
 * Maps to backend DTOs from /reports/* endpoints.
 */

/** Summary stats returned by GET /reports/revenue */
export interface RevenueReport {
  start: string;
  end: string;
  totalRevenue: number;
  totalOrders: number;
}

/** Single day in the weekly revenue trend chart (GET /reports/revenue/trend/week) */
export interface RevenueTrendItem {
  date: string; // "2026-06-27"
  revenue: number;
}

/** Single week in the monthly revenue trend chart (GET /reports/revenue/trend/month) */
export interface MonthlyRevenueTrend {
  weekStart: string;
  weekEnd: string;
  totalRevenue: number;
  totalOrders: number;
}

/** Single item in the top-sellers table (GET /reports/bestsellers) */
export interface TopSellingItem {
  itemId: number;
  itemName: string;
  totalQuantity: number;
  totalRevenue: number;
}
