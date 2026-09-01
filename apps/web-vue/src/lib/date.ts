// vi-VN date helpers shared across pages (replaces per-component Intl stand-ins).
// apps/web uses date-fns with the same visual shapes; Intl keeps zero new deps.

// "1 tháng 9, 2026" — apps/web review/blog long format
export const formatDateLong = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });

// "01/09/2026" — dd/MM/yyyy (apps/web date-fns 'dd/MM/yyyy')
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

// "1 Sept, 2026" — blog card short-month format
export const formatDateShortMonth = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });

// "01/09/2026 14:30" — apps/web date-fns 'dd/MM/yyyy HH:mm', local time
export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

// Replaces date-fns formatDistanceToNow/formatDistance ({ addSuffix: true, locale: vi }).
// One unit table shared by account sessions-list and calendar getRelativeTime.
const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
const RT_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536e6],
  ['month', 2592e6],
  ['day', 864e5],
  ['hour', 36e5],
  ['minute', 6e4],
];

export function relativeTime(date: Date, now: number = Date.now()): string {
  const diffMs = date.getTime() - now;
  const abs = Math.abs(diffMs);
  for (const [unit, ms] of RT_UNITS) {
    if (abs >= ms) return rtf.format(Math.round(diffMs / ms), unit);
  }
  return rtf.format(Math.round(diffMs / 6e4), 'minute');
}
