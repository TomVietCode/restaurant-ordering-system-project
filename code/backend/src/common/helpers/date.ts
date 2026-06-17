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
