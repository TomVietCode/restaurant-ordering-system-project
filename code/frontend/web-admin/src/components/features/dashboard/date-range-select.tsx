'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Format a Date to a "YYYY-MM-DD" string using its **local** calendar parts.
 * Using `toISOString()` here would convert to UTC first, so in Vietnam (+7) an
 * early-morning "today" could shift back to yesterday's date. Local parts keep
 * the value aligned with what the user sees on their clock.
 */
function fmt(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Each preset computes a { start, end } date range on the fly. */
interface Preset {
  label: string;
  value: string;
  getRange: () => { start: string; end: string };
}

const PRESETS: Preset[] = [
  {
    label: 'Hôm nay',
    value: 'today',
    getRange: () => {
      const now = new Date();
      return { start: fmt(now), end: fmt(now) };
    },
  },
  {
    label: '7 ngày qua',
    value: '7d',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      return { start: fmt(start), end: fmt(end) };
    },
  },
  {
    label: '30 ngày qua',
    value: '30d',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 29);
      return { start: fmt(start), end: fmt(end) };
    },
  },
  {
    label: 'Tháng này',
    value: 'this-month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: fmt(start), end: fmt(now) };
    },
  },
  {
    label: 'Tháng trước',
    value: 'last-month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month
      return { start: fmt(start), end: fmt(end) };
    },
  },
];

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

interface DateRangeSelectProps {
  value: string;
  onChange: (presetValue: string, start: string, end: string) => void;
}

/**
 * A dropdown that lets the user pick a predefined time range.
 * When a preset is selected, it calls onChange with the computed start/end dates.
 */
export function DateRangeSelect({ value, onChange }: DateRangeSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => {
        if (!val) return;
        const preset = PRESETS.find((p) => p.value === val);
        if (!preset) return;
        const { start, end } = preset.getRange();
        onChange(val, start, end);
      }}
    >
      <SelectTrigger className="w-[160px]" id="date-range-select">
        <SelectValue placeholder="Chọn thời gian">
          {PRESETS.find((p) => p.value === value)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PRESETS.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Expose presets so the page can compute the initial range. */
export { PRESETS };
