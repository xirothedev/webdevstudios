<script setup lang="ts">
import { Calendar as CalendarIcon, ExternalLink, MapPin, Users, X } from 'lucide-vue-next';

import Button from '@/components/ui/button.vue';
import { EventType, type Event } from '@/lib/events/types';

import {
  formatEventTime,
  getEventTypeColor,
  getEventTypeLabel,
  getRelativeTime,
} from './event-helpers';

const props = defineProps<{ event: Event | null }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <Teleport to="body">
    <template v-if="props.event">
      <div class="fixed inset-0 z-[9998] bg-black/50" @click="emit('close')" />

      <div
        class="fixed top-1/2 left-1/2 z-[9999] max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-4 shadow-xl sm:p-6"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <div class="mb-4 flex items-start justify-between">
          <div class="flex-1">
            <div class="mb-2 flex items-center gap-2">
              <span
                class="h-3 w-3 rounded-full"
                :style="{ backgroundColor: getEventTypeColor(props.event.type) }"
              />
              <span class="text-sm font-medium text-gray-600">{{
                getEventTypeLabel(props.event.type)
              }}</span>
            </div>
            <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">{{ props.event.title }}</h2>
          </div>
          <button
            type="button"
            class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Đóng"
            @click="emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <CalendarIcon class="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <p class="text-sm font-medium text-gray-900">{{ formatEventTime(props.event) }}</p>
              <p class="text-xs text-gray-500">{{ getRelativeTime(props.event) }}</p>
            </div>
          </div>

          <div v-if="props.event.location" class="flex items-start gap-3">
            <MapPin class="mt-0.5 h-5 w-5 text-gray-400" />
            <p class="text-sm text-gray-700">{{ props.event.location }}</p>
          </div>

          <div v-if="props.event.organizer" class="flex items-start gap-3">
            <Users class="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <p class="text-sm text-gray-700">
                <span class="font-medium">Tổ chức bởi:</span> {{ props.event.organizer }}
              </p>
              <p v-if="props.event.attendees" class="text-xs text-gray-500">
                {{ props.event.attendees }} người tham gia
              </p>
            </div>
          </div>

          <div v-if="props.event.description" class="rounded-lg bg-gray-50 p-4">
            <p class="text-sm text-gray-700">{{ props.event.description }}</p>
          </div>

          <div v-if="props.event.type === EventType.SURVEY && props.event.surveyLink" class="pt-2">
            <Button
              as-child
              class="w-full"
              :style="{ backgroundColor: getEventTypeColor(props.event.type) }"
            >
              <a
                :href="props.event.surveyLink"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 text-white"
              >
                <span>Mở khảo sát</span>
                <ExternalLink class="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <Button variant="outline" @click="emit('close')">Đóng</Button>
        </div>
      </div>
    </template>
  </Teleport>
</template>
