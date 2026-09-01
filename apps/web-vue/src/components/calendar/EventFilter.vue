<script setup lang="ts">
import { EventType } from '@/lib/events/types';
import { cn } from '@/lib/cn';

import { getEventTypeColor, getEventTypeLabel } from './event-helpers';

const props = defineProps<{
  selectedTypes: EventType[];
  eventCounts: Record<EventType, number>;
}>();

const emit = defineEmits<{ toggleType: [type: EventType] }>();

const allTypes = Object.values(EventType);
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="type in allTypes"
      :key="type"
      type="button"
      class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium transition-all sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
      :class="
        props.selectedTypes.includes(type)
          ? 'border-gray-900 bg-gray-900 text-white'
          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
      "
      :style="
        props.selectedTypes.includes(type)
          ? { backgroundColor: getEventTypeColor(type), borderColor: getEventTypeColor(type) }
          : undefined
      "
      @click="emit('toggleType', type)"
    >
      <span
        class="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
        :style="{ backgroundColor: getEventTypeColor(type) }"
      />
      <span class="whitespace-nowrap">{{ getEventTypeLabel(type) }}</span>
      <span
        v-if="props.eventCounts[type] > 0"
        :class="
          cn(
            'rounded-full px-1 py-0.5 text-[10px] sm:px-1.5 sm:text-xs',
            props.selectedTypes.includes(type) ? 'bg-white/20' : 'bg-gray-100',
          )
        "
      >
        {{ props.eventCounts[type] }}
      </span>
    </button>
  </div>
</template>
