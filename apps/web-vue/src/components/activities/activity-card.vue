<script setup lang="ts">
// Port of apps/web src/components/activities/ActivityCard.tsx.
import { ArrowRight, Calendar, Code, MapPin, Users, Zap } from 'lucide-vue-next';
import { motion } from 'motion-v';

import type { Activity } from '@/data/activities';

const props = defineProps<{ activity: Activity }>();

const categoryMeta: Record<
  Activity['category'],
  { icon: typeof Code; iconClass: string; label: string }
> = {
  academic: { icon: Code, iconClass: 'text-blue-400', label: 'Học thuật' },
  community: { icon: Users, iconClass: 'text-green-400', label: 'Cộng đồng' },
  event: { icon: Zap, iconClass: 'text-wds-accent', label: 'Sự kiện' },
};
</script>

<template>
  <motion.div
    layout
    :initial="{ opacity: 0, scale: 0.9 }"
    :animate="{ opacity: 1, scale: 1 }"
    :exit="{ opacity: 0, scale: 0.9 }"
    :transition="{ duration: 0.3 }"
    class="group hover:border-wds-accent/50 relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/3 transition-colors"
  >
    <!-- Image Section -->
    <div class="relative h-56 overflow-hidden">
      <div
        class="absolute inset-0 z-10 bg-linear-to-t from-black via-transparent to-transparent opacity-60"
      />
      <img
        :src="props.activity.image"
        :alt="props.activity.title"
        loading="lazy"
        class="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <!-- Category Badge -->
      <div class="absolute top-4 left-4 z-20">
        <span
          class="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md"
        >
          <component
            :is="categoryMeta[props.activity.category].icon"
            :size="12"
            :class="categoryMeta[props.activity.category].iconClass"
          />
          <span>{{ categoryMeta[props.activity.category].label }}</span>
        </span>
      </div>

      <div class="absolute bottom-4 left-4 z-20 flex flex-col gap-1">
        <div class="flex items-center gap-2 text-xs text-gray-300">
          <Calendar :size="12" /> {{ props.activity.date }}
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="flex flex-1 flex-col gap-3 p-6">
      <h3
        class="group-hover:text-wds-accent line-clamp-2 text-xl font-bold text-white transition-colors"
      >
        {{ props.activity.title }}
      </h3>

      <div class="mb-2 flex items-center gap-2 text-xs text-gray-500">
        <MapPin :size="12" /> {{ props.activity.location }}
        <span class="h-1 w-1 rounded-full bg-gray-600" />
        <Users :size="12" /> {{ props.activity.attendees }} tham gia
      </div>

      <p class="mb-4 line-clamp-3 text-sm text-gray-400">{{ props.activity.description }}</p>

      <div class="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
        <button
          class="group-hover:text-wds-accent flex items-center gap-2 text-sm font-medium text-white transition-colors"
        >
          Xem chi tiết{' '}
          <ArrowRight :size="14" class="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  </motion.div>
</template>
