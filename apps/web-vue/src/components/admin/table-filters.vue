<script setup lang="ts">
import { Search, X } from 'lucide-vue-next';
import { computed } from 'vue';

import Button from '@/components/ui/button.vue';
import { Input } from '@/components/ui/input.vue';

interface FilterOption {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    searchPlaceholder?: string;
    search?: string;
    filters?: Array<{
      id: string;
      label: string;
      type: 'select' | 'text';
      options?: FilterOption[];
    }>;
    filterValues?: Record<string, string>;
    onClear?: () => void;
  }>(),
  { searchPlaceholder: 'Search...', filters: () => [], filterValues: () => ({}) },
);

const emit = defineEmits<{
  'update:search': [value: string];
  'update:filterValue': [id: string, value: string];
}>();

// apps/web TableFilters auto-prefixes an "All {label}" option — kept here, pages pass the
// real options only (apps/web also passed an explicit All option → duplicated it; not mirrored).
const hasActiveFilters = computed(
  () => props.search || Object.values(props.filterValues).some((v) => !!v),
);
</script>

<template>
  <div
    class="border-wds-accent/30 bg-wds-background flex flex-wrap items-center gap-4 rounded-2xl border p-4"
  >
    <!-- search box only when the parent passes :search (mirrors apps/web onSearchChange) -->
    <div v-if="search !== undefined" class="relative min-w-[200px] flex-1">
      <Search class="text-wds-text/50 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        type="text"
        :placeholder="searchPlaceholder"
        :value="search ?? ''"
        class="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 pl-9"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div v-for="filter in filters" :key="filter.id" class="min-w-[150px]">
      <select
        v-if="filter.type === 'select' && filter.options"
        :value="filterValues[filter.id] || ''"
        class="border-wds-accent/30 bg-wds-background text-wds-text focus:border-wds-accent focus:ring-wds-accent/20 flex h-11 w-full rounded-lg border px-4 py-2 text-sm focus:ring-2 focus:outline-none"
        @change="emit('update:filterValue', filter.id, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">All {{ filter.label }}</option>
        <option v-for="option in filter.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <Input
        v-else
        type="text"
        :placeholder="filter.label"
        :value="filterValues[filter.id] || ''"
        class="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50"
        @input="emit('update:filterValue', filter.id, ($event.target as HTMLInputElement).value)"
      />
    </div>
    <Button
      v-if="hasActiveFilters && onClear"
      variant="outline"
      class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10"
      @click="
        emit('update:search', '');
        onClear?.();
      "
    >
      <X class="h-4 w-4" />
      Clear
    </Button>
  </div>
</template>
