/**
 * Vietnam-timezone date/time formatting helpers.
 *
 * The backend stores and returns timestamps as UTC instants; we always display
 * them in Vietnam local time (Asia/Ho_Chi_Minh) regardless of where the code
 * runs (browser or SSR). Use these helpers instead of ad-hoc `toLocale*` calls
 * so the timezone is applied consistently.
 */
export const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

/** "HH:mm | dd/MM/yyyy" in Vietnam time. Returns "—" for invalid input. */
export function formatVnDateTime(value: string | Date): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '—';
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: VN_TIMEZONE });
  const date = d.toLocaleDateString('vi-VN', { timeZone: VN_TIMEZONE });
  return `${time} | ${date}`;
}

/** "dd/MM/yyyy" in Vietnam time. Returns "—" for invalid input. */
export function formatVnDate(value: string | Date): string {
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { timeZone: VN_TIMEZONE });
}
