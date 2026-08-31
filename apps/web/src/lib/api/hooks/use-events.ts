/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository on GitHub
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

import { useQuery } from '@tanstack/react-query';

import { eventsApi, type ApiEvent } from '@/lib/api/events';
import { mockEvents } from '@/lib/events/mock-events';
import { EventType, type Event } from '@/lib/events/types';

// ponytail: mock data doubles as the offline/failed-request fallback adapter
const eventKeys = {
  all: ['events'] as const,
};

const knownTypes = new Set(Object.values(EventType));

function toEvent(e: ApiEvent): Event {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    start: new Date(e.startDate),
    end: new Date(e.endDate),
    location: e.location,
    type: knownTypes.has(e.type) ? e.type : EventType.OTHER,
    organizer: e.organizer,
    attendees: e.attendees,
    surveyLink: e.surveyLink,
  };
}

// Query: list events for the calendar. Falls back to mock data while the API
// is unavailable so the calendar keeps rendering.
export function useEvents() {
  const query = useQuery({
    queryKey: eventKeys.all,
    queryFn: async () => (await eventsApi.getEvents()).map(toEvent),
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    events: query.isError || query.data === undefined ? mockEvents : query.data,
  };
}
