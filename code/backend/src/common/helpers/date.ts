import { BadRequestException } from '@nestjs/common';
import { format } from 'date-fns';

export function parseDurationToSeconds(duration: string): number {
  const value = parseInt(duration.slice(0, -1), 10);
  const unit = duration.slice(-1);

  switch (unit) {
    case 'd':
      return value * 86400; // 24 * 60 * 60
    case 'h':
      return value * 3600; // 60 * 60
    case 'm':
      return value * 60;
    case 's':
      return value;
    default:
      return 7 * 86400; // Default: 7 days
  }
}

export function getStartOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getStartOfTomorrow(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date;
}

/** Return a new Date at 00:00:00.000 of the given day (immutable). */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Return a new Date shifted by `days` days (immutable; may be negative). */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Return the Monday (00:00) of the ISO week containing `date`.
 * Matches Postgres `date_trunc('week', ...)`, which also anchors weeks on Monday.
 */
export function startOfWeekMonday(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 = Sunday .. 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(d, diffToMonday);
}

export function formatDate(date: Date, pattern = 'yyyy-MM-dd'): string {
  return format(date, pattern);
}

export function checkDate(start: Date, end: Date): void {
  if (start > end) {
    throw new BadRequestException('Start date must be greater than or equal to End date.');
  }
}
