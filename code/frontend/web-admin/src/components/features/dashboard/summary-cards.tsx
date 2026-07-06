'use client';

import { Banknote, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

/** Format a number as Vietnamese Dong: 1500000 → "1.500.000 ₫" */
function formatVND(n: number): string {
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

interface SummaryCardsProps {
  totalRevenue: number | null;
  totalOrders: number | null;
  loading: boolean;
}

/**
 * Two side-by-side cards showing total revenue and total orders.
 * Shows skeleton placeholders when `loading` is true.
 */
export function SummaryCards({ totalRevenue, totalOrders, loading }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* --- Total Revenue Card --- */}
      <Card className="relative overflow-hidden">
        <CardContent className="flex items-center gap-4 py-5">
          {/* Icon circle with a subtle primary tint */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light">
            <Banknote className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
            {loading ? (
              <Skeleton className="mt-1 h-7 w-36" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-foreground" id="total-revenue">
                {formatVND(totalRevenue ?? 0)}
              </p>
            )}
          </div>
        </CardContent>
        {/* Decorative gradient accent on the left edge */}
        <span className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-primary to-primary-dark" />
      </Card>

      {/* --- Total Orders Card --- */}
      <Card className="relative overflow-hidden">
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <ShoppingCart className="h-6 w-6 text-info" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
            {loading ? (
              <Skeleton className="mt-1 h-7 w-20" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-foreground" id="total-orders">
                {totalOrders ?? 0}
              </p>
            )}
          </div>
        </CardContent>
        <span className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-info to-blue-600" />
      </Card>
    </div>
  );
}
