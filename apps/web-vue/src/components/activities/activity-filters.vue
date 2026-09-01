<script setup lang="ts">
// Port of apps/web src/components/activities/ActivityFilters.tsx.
import { Search } from 'lucide-vue-next';

import FilterButton from '@/components/activities/filter-button.vue';
import type { Category } from '@/data/activities';

defineProps<{
  activeCategory: string;
  searchQuery: string;
  categories: Category[];
}>();

const emit = defineEmits<{
  selectCategory: [id: string];
  updateSearch: [query: string];
}>();
</script>

<template>
  <div
    class="sticky top-20 z-40 -mx-4 flex flex-col gap-6 rounded-3xl border border-white/5 bg-black/80 p-4 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between"
  >
    <!-- Filters -->
    <div class="flex flex-wrap gap-2">
      <FilterButton
        v-for="cat in categories"
        :key="cat.id"
        :active="activeCategory === cat.id"
        :on-click="() => emit('selectCategory', cat.id)"
        :icon="cat.icon"
      >
        {{ cat.label }}
      </FilterButton>
    </div>

    <!-- Search -->
    <div class="relative w-full lg:w-72">
      <Search class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" :size="18" />
      <input
        type="text"
        placeholder="Tìm kiếm sự kiện..."
        :value="searchQuery"
        class="focus:border-wds-accent/50 w-full rounded-full border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white transition-all placeholder:text-gray-600 focus:bg-white/10 focus:outline-none"
        @input="emit('updateSearch', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
