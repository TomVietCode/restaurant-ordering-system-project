'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DateRangeSelect, PRESETS } from '@/components/features/dashboard/date-range-select';
import { SummaryCards } from '@/components/features/dashboard/summary-cards';
import { RevenueChart } from '@/components/features/dashboard/revenue-chart';
import { TopSellingTable } from '@/components/features/dashboard/top-selling-table';
import { reportService } from '@/services/report.service';
import type { TopSellingItem } from '@/types/report';

export default function DashboardPage() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;

  // Initialize with "Tháng này" preset using lazy state initialization
  const [preset, setPreset] = useState(() => {
    const defaultPreset = PRESETS.find((p) => p.value === 'this-month')!;
    return defaultPreset.value;
  });

  const [start, setStart] = useState(() => {
    const defaultPreset = PRESETS.find((p) => p.value === 'this-month')!;
    return defaultPreset.getRange().start;
  });

  const [end, setEnd] = useState(() => {
    const defaultPreset = PRESETS.find((p) => p.value === 'this-month')!;
    return defaultPreset.getRange().end;
  });

  // Summary data
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Top sellers data
  const [topItems, setTopItems] = useState<TopSellingItem[]>([]);
  const [topLoading, setTopLoading] = useState(true);

  // ── Fetch dashboard data in parallel (async-parallel) ──────
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    
    // Defer execution to the next microtask to prevent synchronous setState within the effect
    await Promise.resolve();
    
    setSummaryLoading(true);
    setTopLoading(true);
    try {
      const [report, items] = await Promise.all([
        reportService.getRevenue(start, end, token),
        reportService.getBestsellers(start, end, token),
      ]);
      setTotalRevenue(report.totalRevenue);
      setTotalOrders(report.totalOrders);
      setTopItems(items);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setTotalRevenue(0);
      setTotalOrders(0);
      setTopItems([]);
    } finally {
      setSummaryLoading(false);
      setTopLoading(false);
    }
  }, [start, end, token]);

  // Re-fetch when date range or token changes
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchDashboardData();
    });
  }, [fetchDashboardData]);

  // ── Handle preset change with stable reference ────────────
  const handleDateChange = useCallback((presetValue: string, newStart: string, newEnd: string) => {
    setPreset(presetValue);
    setStart(newStart);
    setEnd(newEnd);
  }, []);

  return (
    <div className="flex flex-col gap-6 lg:h-[calc(100vh-8rem)]">
      {/* ── Header row: title + date filter ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Báo cáo doanh thu
          </h1>
        </div>
        <DateRangeSelect value={preset} onChange={handleDateChange} />
      </div>

      {/* ── Summary cards ── */}
      <div className="shrink-0">
        <SummaryCards
          totalRevenue={totalRevenue}
          totalOrders={totalOrders}
          loading={summaryLoading}
        />
      </div>

      {/* ── Chart + Top sellers row ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:flex-1 lg:min-h-0">
        {/* Chart takes 3/5 of the width on large screens */}
        <div className="lg:col-span-3 lg:h-full lg:flex lg:flex-col">
          <RevenueChart preset={preset} dateStart={start} dateEnd={end} token={token} />
        </div>
        {/* Top sellers table takes 2/5 */}
        <div className="lg:col-span-2 lg:h-full lg:flex lg:flex-col">
          <TopSellingTable items={topItems} loading={topLoading} />
        </div>
      </div>
    </div>
  );
}
