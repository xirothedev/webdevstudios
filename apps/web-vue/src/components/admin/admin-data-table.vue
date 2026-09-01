<script setup lang="ts">
// Shared users/orders/transactions/products table shape:
// filters slot + ColumnVisibilityToggle + DataTable (cell-* slots forwarded) + pagination footer.
import { computed, ref, useSlots } from 'vue';

import ColumnVisibilityToggle from './column-visibility-toggle.vue';
import DataTable from './data-table.vue';

const props = withDefaults(
  defineProps<{
    columns: Array<{ id: string; label: string }>;
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    isLoading?: boolean;
    emptyMessage?: string;
    page?: number;
    limit?: number;
    // null/undefined hides the footer (products has no pagination)
    pagination?: { total: number; totalPages?: number } | null;
    subject?: string;
    // pages without totalPages (orders) pass their own next-disable rule
    nextDisabled?: boolean;
  }>(),
  {
    isLoading: false,
    emptyMessage: 'No data available',
    page: 1,
    limit: 10,
    nextDisabled: undefined,
  },
);

const emit = defineEmits<{ 'update:page': [value: number] }>();

const visibleColumns = ref<string[]>(props.columns.map((c) => c.id));

const slots = useSlots();
const cellSlots = computed(() => Object.keys(slots).filter((name) => name.startsWith('cell-')));

const totalPages = computed(() => props.pagination?.totalPages ?? 0);
</script>

<template>
  <div class="flex items-center justify-between">
    <slot name="filters" />
    <ColumnVisibilityToggle v-model="visibleColumns" :columns="columns" />
  </div>
  <DataTable
    :columns="columns"
    :data="data"
    :visible-columns="visibleColumns"
    :is-loading="isLoading"
    :empty-message="emptyMessage"
  >
    <template v-for="(_, name) in cellSlots" #[name]="scope: any">
      <slot :name="name" v-bind="scope || {}" />
    </template>
  </DataTable>
  <div v-if="pagination" class="text-wds-text/70 flex items-center justify-between text-sm">
    <div>
      Showing {{ (page - 1) * limit + 1 }} to {{ Math.min(page * limit, pagination.total) }} of
      {{ pagination.total }} {{ subject }}
    </div>
    <div class="flex gap-2">
      <button
        class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 disabled:opacity-50"
        :disabled="page === 1"
        @click="emit('update:page', Math.max(1, page - 1))"
      >
        Previous
      </button>
      <button
        class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 disabled:opacity-50"
        :disabled="nextDisabled ?? page >= totalPages"
        @click="emit('update:page', totalPages ? Math.min(totalPages, page + 1) : page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>
