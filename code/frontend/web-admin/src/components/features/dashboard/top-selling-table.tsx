'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TopSellingItem } from '@/types/report';

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

// Format number as VND: 1500000 → "1.500.000 ₫"
function formatVND(n: number): string {
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

interface TopSellingTableProps {
  items: TopSellingItem[];
  loading: boolean;
  title: string;
}

/**
 * A ranked table of the top 10 best-selling items.
 * Uses a compact, scrollable layout that fits beside the chart.
 */
export function TopSellingTable({ items, loading, title }: TopSellingTableProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto pt-0 min-h-0">
        {loading ? (
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full items-center justify-center py-10 text-sm text-muted-foreground">
            Không có dữ liệu
          </div>
        ) : (
          <table className="w-full text-sm" id="top-selling-table">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-2 font-medium text-center w-8">#</th>
                <th className="pb-2 pr-2 font-medium">Món</th>
                <th className="pb-2 pr-2 text-right font-medium">SL</th>
                <th className="pb-2 text-right font-medium">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.itemId}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors"
                >
                  <td className="py-2 pr-2 text-center font-semibold text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="py-2 pr-2 font-medium truncate max-w-[140px]" title={item.itemName}>
                    {item.itemName}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {item.totalQuantity}
                  </td>
                  <td className="py-2 text-right tabular-nums text-primary font-medium">
                    {formatVND(item.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
