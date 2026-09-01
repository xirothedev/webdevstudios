// date-fns is not installed in web-vue — Intl replaces formatDistanceToNow (same approach as
// components/calendar/event-helpers.ts).

const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });

// Replaces formatDistanceToNow(date, { addSuffix: true }) with vi locale.
export function formatDistanceToNowVi(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536e6],
    ['month', 2592e6],
    ['day', 864e5],
    ['hour', 36e5],
    ['minute', 6e4],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diffMs / ms), unit);
  }
  return rtf.format(Math.round(diffMs / 6e4), 'minute');
}
