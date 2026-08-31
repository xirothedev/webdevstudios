import { EventType, type Event } from '@/lib/events/types';

// ponytail: apps/web imports these from src/lib/events/utils.ts, which was not
// ported to web-vue (lib/events only shipped types + mock). Calendar is the only
// consumer, so the pure presentation helpers live in this slice's own dir.
// date-fns is not installed in web-vue — plain Date + Intl replace formatDistance.

export function filterEventsByType(events: Event[], types: EventType[]): Event[] {
  if (types.length === 0) return events;
  return events.filter((event) => types.includes(event.type));
}

export function getEventTypeColor(type: EventType): string {
  switch (type) {
    case EventType.MEETING:
      return '#3B82F6';
    case EventType.WORKSHOP:
      return '#F7931E';
    case EventType.SOCIAL:
      return '#10B981';
    case EventType.COMPETITION:
      return '#8B5CF6';
    case EventType.SURVEY:
      return '#EC4899';
    case EventType.OTHER:
      return '#6B7280';
    default:
      return '#6B7280';
  }
}

export function getEventTypeLabel(type: EventType): string {
  switch (type) {
    case EventType.MEETING:
      return 'Cuộc họp';
    case EventType.WORKSHOP:
      return 'Workshop';
    case EventType.SOCIAL:
      return 'Sự kiện xã hội';
    case EventType.COMPETITION:
      return 'Cuộc thi';
    case EventType.SURVEY:
      return 'Khảo sát';
    case EventType.OTHER:
      return 'Khác';
    default:
      return 'Khác';
  }
}

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function formatEventTime(event: Event): string {
  const startDate = fmtDate(event.start);
  const endDate = fmtDate(event.end);
  const range = `${fmtTime(event.start)} - ${fmtTime(event.end)}`;
  return startDate === endDate
    ? `${startDate} ${range}`
    : `${startDate} ${fmtTime(event.start)} - ${endDate} ${fmtTime(event.end)}`;
}

const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });

// Replaces date-fns formatDistance(..., { addSuffix: true, locale: vi }).
function distanceToNow(date: Date): string {
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

export function getRelativeTime(event: Event): string {
  const now = Date.now();
  if (event.start.getTime() > now) return `Bắt đầu ${distanceToNow(event.start)}`;
  if (event.end.getTime() > now) return `Đang diễn ra - Kết thúc ${distanceToNow(event.end)}`;
  return `Đã kết thúc ${distanceToNow(event.end)}`;
}
