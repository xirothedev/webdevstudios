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

'use client';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

import { format, getDay, parse, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useCallback, useMemo, useState } from 'react';
import type { Event as RBCEvent } from 'react-big-calendar';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';

import { mockEvents } from '@/lib/events/mock-events';
import { Event, EventType } from '@/lib/events/types';
import { filterEventsByType, getEventTypeColor } from '@/lib/events/utils';

import { EventDetailsModal } from './EventDetailsModal';
import { EventFilter } from './EventFilter';

// Setup date-fns localizer
const locales = {
  vi: vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: vi }),
  getDay,
  locales,
});

interface CalendarEvent extends RBCEvent {
  resource: Event;
}

export function CalendarContainer() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);

  // Calculate event counts per type
  const eventCounts = useMemo(() => {
    const counts: Record<EventType, number> = {
      [EventType.MEETING]: 0,
      [EventType.WORKSHOP]: 0,
      [EventType.SOCIAL]: 0,
      [EventType.COMPETITION]: 0,
      [EventType.SURVEY]: 0,
      [EventType.OTHER]: 0,
    };

    mockEvents.forEach((event) => {
      counts[event.type]++;
    });

    return counts;
  }, []);

  // Filter events based on selected types
  const filteredEvents = useMemo(() => {
    if (selectedTypes.length === 0) {
      return mockEvents;
    }
    return filterEventsByType(mockEvents, selectedTypes);
  }, [selectedTypes]);

  // Convert events to react-big-calendar format
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return filteredEvents.map((event) => ({
      title: event.title,
      start: event.start,
      end: event.end,
      resource: event,
    }));
  }, [filteredEvents]);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setIsModalOpen(true);
  }, []);

  // Handle slot selection (for creating new events - future feature)
  const handleSelectSlot = useCallback(() => {
    // Future: Open create event modal
  }, []);

  // Handle view change
  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  // Handle date navigation
  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Toggle event type filter
  const handleToggleType = useCallback((type: EventType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  // Event style getter
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const color = getEventTypeColor(event.resource.type);
    return {
      style: {
        backgroundColor: color,
        color: 'white',
        border: `1px solid ${color}`,
      },
    };
  }, []);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Event Filter */}
      <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
        <h3 className="mb-2 text-xs font-semibold text-gray-900 sm:mb-3 sm:text-sm">
          Lọc sự kiện
        </h3>
        <EventFilter
          selectedTypes={selectedTypes}
          onToggleType={handleToggleType}
          eventCounts={eventCounts}
        />
      </div>

      {/* Calendar */}
      <div className="rounded-lg border border-gray-200 bg-white p-2 sm:p-4">
        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            date={currentDate}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            messages={{
              next: 'Tiếp',
              previous: 'Trước',
              today: 'Hôm nay',
              month: 'Tháng',
              week: 'Tuần',
              day: 'Ngày',
              date: 'Ngày',
              time: 'Giờ',
              event: 'Sự kiện',
              noEventsInRange: 'Không có sự kiện trong khoảng thời gian này.',
              showMore: (total) => `+${total} sự kiện khác`,
            }}
          />
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}
