<script setup lang="ts">
import CalendarContainer from '@/components/calendar/CalendarContainer.vue';
import { usePageMeta } from '@/lib/metadata';

usePageMeta({
  title: 'Lịch sự kiện',
  description: 'Xem tất cả các sự kiện, workshop và hoạt động của WebDev Studios',
  path: '/calendar',
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div class="mb-4 sm:mb-6 lg:mb-8">
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">Lịch sự kiện</h1>
        <p class="mt-2 text-base text-gray-600 sm:text-lg">
          Xem tất cả các sự kiện, workshop và hoạt động của WebDev Studios
        </p>
      </div>
      <CalendarContainer />
    </div>
  </div>
</template>
