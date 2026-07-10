'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { reportService } from '@/services/report.service';

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

/**
 * Abbreviate large VND values for the Y-axis:
 * 1_500_000 → "1.5M", 200_000 → "200K", 500 → "500"
 */
function abbreviateVND(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

/** Full VND format for the tooltip: "1.500.000 ₫" */
function formatVND(n: number): string {
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

/**
 * Shorten an ISO date "2026-06-27" → "27/06" for the X-axis label.
 * Keeps the chart clean and readable.
 */
function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

// ──────────────────────────────────────────────────────────────
// Chart data shape (unified for both week and month views)
// ──────────────────────────────────────────────────────────────

interface ChartDatum {
  label: string; // X-axis label
  revenue: number;
}

// ──────────────────────────────────────────────────────────────
// Custom Tooltip
// ──────────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  value: number;
  payload: ChartDatum;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const { label, revenue } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-primary">{formatVND(revenue)}</p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

type TrendMode = 'day' | 'month';

interface RevenueChartProps {
  /** Currently selected date-range preset (e.g. 'today', '7d', '30d', 'this-month'). */
  preset: string;
  /** Range start "YYYY-MM-DD" — drives the month trend span. */
  dateStart: string;
  /** Range end "YYYY-MM-DD" — anchors the daily trend and closes the month span. */
  dateEnd: string;
  token: string | null;
}

/**
 * Which trend tab a preset opens on: short ranges show the daily ("Ngày") view,
 * month-scale ranges show the weekly ("Tháng") view.
 */
function defaultModeForPreset(preset: string): TrendMode {
  return preset === 'today' || preset === '7d' ? 'day' : 'month';
}

export function RevenueChart({ preset, dateStart, dateEnd }: RevenueChartProps) {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;

  const [mode, setMode] = useState<TrendMode>(() => defaultModeForPreset(preset));
  const [data, setData] = useState<ChartDatum[]>([]);
  const [loading, setLoading] = useState(true);

  // Snap the tab to the preset's default whenever the preset changes, while
  // still allowing a manual tab toggle within a given preset. (React's
  // "adjust state during render" pattern — no effect needed.)
  const [prevPreset, setPrevPreset] = useState(preset);
  if (preset !== prevPreset) {
    setPrevPreset(preset);
    setMode(defaultModeForPreset(preset));
  }

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (mode === 'day') {
        // Daily revenue for the 7 days ending on the range end (incl. today).
        const items = await reportService.getDailyTrend(dateEnd, token);
        setData(items.map((i) => ({ label: shortDate(i.date), revenue: i.revenue })));
      } else {
        // Weekly aggregates spanning the selected range.
        const items = await reportService.getMonthTrend(dateStart, dateEnd, token);
        setData(
          items.map((i) => ({
            label: `${shortDate(i.weekStart)} – ${shortDate(i.weekEnd)}`,
            revenue: i.totalRevenue,
          })),
        );
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [mode, dateStart, dateEnd, token]);

  // Re-fetch whenever mode, date range, or token changes
  useEffect(() => {
    Promise.resolve().then(() => fetchData());
  }, [fetchData]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold">Xu hướng doanh thu</CardTitle>
          {/* Tab-style toggle for day / month */}
          <div className="flex gap-1 rounded-lg bg-muted p-0.5 shrink-0">
            {(['day', 'month'] as const).map((m) => (
              <button
                key={m}
                id={`trend-tab-${m}`}
                onClick={() => setMode(m)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                  mode === m
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'day' ? 'Ngày' : 'Tháng'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 pt-2 relative">
        {loading ? (
          <Skeleton className="h-full min-h-[280px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-muted-foreground">
            Không có dữ liệu
          </div>
        ) : (
          <div className="h-full min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                {/* Dashed grid lines for visual reference */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={abbreviateVND}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'var(--accent)', radius: 4 }}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  animationDuration={600}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
