import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { eventsApi, type ApiEvent } from '@/lib/api/events';
import { mockEvents } from '@/lib/events/mock-events';
import { EventType, type Event } from '@/lib/events/types';

// ponytail: mock data doubles as the offline/failed-request fallback adapter
export const eventKeys = {
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
    events: computed(() =>
      query.isError.value || query.data.value === undefined ? mockEvents : query.data.value,
    ),
  };
}
