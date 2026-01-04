/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { format, formatDistance } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Event, EventType } from './types';

export function filterEventsByType(
  events: Event[],
  types: EventType[]
): Event[] {
  if (types.length === 0) return events;
  return events.filter((event) => types.includes(event.type));
}

export function getEventsByDateRange(
  events: Event[],
  start: Date,
  end: Date
): Event[] {
  return events.filter((event) => {
    return event.start >= start && event.end <= end;
  });
}

export function formatEventTime(event: Event): string {
  const startTime = format(event.start, 'HH:mm', { locale: vi });
  const endTime = format(event.end, 'HH:mm', { locale: vi });
  const startDate = format(event.start, 'dd/MM/yyyy', { locale: vi });
  const endDate = format(event.end, 'dd/MM/yyyy', { locale: vi });

  if (startDate === endDate) {
    return `${startDate} ${startTime} - ${endTime}`;
  }
  return `${startDate} ${startTime} - ${endDate} ${endTime}`;
}

export function getEventTypeColor(type: EventType): string {
  switch (type) {
    case EventType.MEETING:
      return '#3B82F6'; // Blue
    case EventType.WORKSHOP:
      return '#F7931E'; // Orange - brand color
    case EventType.SOCIAL:
      return '#10B981'; // Green
    case EventType.COMPETITION:
      return '#8B5CF6'; // Purple
    case EventType.SURVEY:
      return '#EC4899'; // Pink
    case EventType.OTHER:
      return '#6B7280'; // Gray
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

export function getRelativeTime(event: Event): string {
  const now = new Date();
  if (event.start > now) {
    return `Bắt đầu ${formatDistance(event.start, now, {
      addSuffix: true,
      locale: vi,
    })}`;
  }
  if (event.end > now) {
    return `Đang diễn ra - Kết thúc ${formatDistance(event.end, now, {
      addSuffix: true,
      locale: vi,
    })}`;
  }
  return `Đã kết thúc ${formatDistance(event.end, now, {
    addSuffix: true,
    locale: vi,
  })}`;
}
