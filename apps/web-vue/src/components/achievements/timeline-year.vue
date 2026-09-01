<script setup lang="ts">
// Port of apps/web src/components/achievements/TimelineYear.tsx.
import AchievementCard from '@/components/achievements/achievement-card.vue';
import type { AwardItem } from '@/data/achievements';

withDefaults(defineProps<{ year: number; items: AwardItem[]; isLast?: boolean }>(), {
  isLast: false,
});
</script>

<template>
  <div class="relative mb-16" :class="isLast ? 'mb-0' : ''">
    <!-- Year Marker -->
    <div class="mb-8 flex items-center gap-4">
      <div
        class="bg-wds-accent relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-black shadow-[0_0_20px_rgba(247,147,30,0.4)]"
      >
        {{ year }}
      </div>
      <div class="from-wds-accent/50 h-px flex-1 bg-linear-to-r to-transparent" />
    </div>

    <!-- Connecting Line (Desktop) -->
    <div
      v-if="!isLast"
      class="from-wds-accent/30 absolute top-16 bottom-[-64px] left-8 hidden w-px bg-linear-to-b to-transparent md:block"
    />

    <!-- Awards Grid -->
    <div class="grid grid-cols-1 gap-6 md:pl-24 lg:grid-cols-2 xl:grid-cols-3">
      <AchievementCard v-for="(item, index) in items" :key="item.id" :item="item" :index="index" />
    </div>
  </div>
</template>
