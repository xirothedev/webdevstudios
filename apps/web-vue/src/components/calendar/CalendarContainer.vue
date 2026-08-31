<script setup lang="ts">
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import viLocale from '@fullcalendar/core/locales/vi';
import FullCalendar from '@fullcalendar/vue3';
import { computed, ref } from 'vue';

import type { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import { useEvents } from '@/lib/api/hooks/use-events';
import { EventType, type Event } from '@/lib/events/types';

import './calendar.css';
import EventDetailsModal from './EventDetailsModal.vue';
import EventFilter from './EventFilter.vue';
import { filterEventsByType, getEventTypeColor } from './event-helpers';

const { events } = useEvents();

const selectedTypes = ref<EventType[]>([]);
const selectedEvent = ref<Event | null>(null);

const eventCounts = computed(() => {
  const counts = {} as Record<EventType, number>;
  for (const t of Object.values(EventType)) counts[t] = 0;
  for (const e of events.value) counts[e.type]++;
  return counts;
});

const filteredEvents = computed(() => filterEventsByType(events.value, selectedTypes.value));

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  locale: viLocale,
  initialView: 'dayGridMonth',
  firstDay: 1,
  height: 'auto',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  buttonText: {
    prev: 'Trước',
    next: 'Tiếp',
    today: 'Hôm nay',
    dayGridMonth: 'Tháng',
    timeGridWeek: 'Tuần',
    timeGridDay: 'Ngày',
  },
  dayGridMonth: { noEventsMessage: 'Không có sự kiện trong khoảng thời gian này.' },
  timeGridWeek: { noEventsMessage: 'Không có sự kiện trong khoảng thời gian này.' },
  timeGridDay: { noEventsMessage: 'Không có sự kiện trong khoảng thời gian này.' },
  moreLinkText: (n: number) => `+${n} sự kiện khác`,
  events: filteredEvents.value.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    backgroundColor: getEventTypeColor(event.type),
    borderColor: getEventTypeColor(event.type),
    textColor: '#ffffff',
    extendedProps: { event },
  })),
  eventClick: (info: EventClickArg) => {
    selectedEvent.value = info.event.extendedProps.event as Event;
  },
}));

function toggleType(type: EventType) {
  selectedTypes.value = selectedTypes.value.includes(type)
    ? selectedTypes.value.filter((t) => t !== type)
    : [...selectedTypes.value, type];
}
</script>

<template>
  <div class="w-full space-y-4 sm:space-y-6">
    <div class="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
      <h3 class="mb-2 text-xs font-semibold text-gray-900 sm:mb-3 sm:text-sm">Lọc sự kiện</h3>
      <EventFilter
        :selected-types="selectedTypes"
        :event-counts="eventCounts"
        @toggle-type="toggleType"
      />
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-2 sm:p-4">
      <div class="wds-calendar">
        <FullCalendar :options="calendarOptions" />
      </div>
    </div>

    <EventDetailsModal :event="selectedEvent" @close="selectedEvent = null" />
  </div>
</template>
