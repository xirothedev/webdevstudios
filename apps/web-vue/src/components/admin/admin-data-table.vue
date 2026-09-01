<script setup lang="ts">
// Shared users/orders/transactions/products table shape:
// filters slot + ColumnVisibilityToggle + DataTable (cell-* slots forwarded) + pagination footer.
import { computed, ref, useSlots } from 'vue';

import ColumnVisibilityToggle from './column-visibility-toggle.vue';
import DataTable from './data-table.vue';
import { nextDisabledFor } from './pagination';

const props = withDefaults(
  defineProps<{
    columns: Array<{ id: string; label: string }>;
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    rows: any[];
    isLoading?: boolean;
    emptyMessage?: string;
    limit?: number;
    // undefined hides the footer (products has no pagination)
    total?: number;
    subject?: string;
  }>(),
  {
    isLoading: false,
    emptyMessage: 'No data available',
    limit: 10,
    total: undefined,
    subject: '',
  },
);

const page = defineModel<number>('page', { default: 1 });

const visibleColumns = ref<string[]>(props.columns.map((c) => c.id));

const slots = useSlots();
const cellSlots = computed(() => Object.keys(slots).filter((name) => name.startsWith('cell-')));

const totalPages = computed(() =>
  props.total == null ? 0 : Math.max(1, Math.ceil(props.total / props.limit)),
);
const nextDisabled = computed(() =>
  nextDisabledFor(page.value, props.total, props.rows, props.limit),
);
</script>

<template>
  <div class="flex items-center justify-between">
    <slot name="filters" />
    <ColumnVisibilityToggle v-model="visibleColumns" :columns="columns" />
  </div>
  <DataTable
    :columns="columns"
    :data="rows"
    :visible-columns="visibleColumns"
    :is-loading="isLoading"
    :empty-message="emptyMessage"
  >
    <template v-for="(_, name) in cellSlots" #[name]="scope: any">
      <slot :name="name" v-bind="scope || {}" />
    </template>
  </DataTable>
  <div v-if="total != null" class="text-wds-text/70 flex items-center justify-between text-sm">
    <div>
      Showing {{ (page - 1) * limit + 1 }} to {{ Math.min(page * limit, total) }} of {{ total }}
      {{ subject }}
    </div>
    <div class="flex gap-2">
      <button
        class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 disabled:opacity-50"
        :disabled="page === 1"
        @click="page = Math.max(1, page - 1)"
      >
        Previous
      </button>
      <button
        class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10 rounded-lg border px-4 py-2 disabled:opacity-50"
        :disabled="nextDisabled"
        @click="page = totalPages ? Math.min(totalPages, page + 1) : page + 1"
      >
        Next
      </button>
    </div>
  </div>
</template>
