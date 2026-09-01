<script setup lang="ts">
import { computed, useSlots } from 'vue';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.vue';

const props = withDefaults(
  defineProps<{
    // apps/web DataTable is `any[]` too — rows carry formatted strings and slot content
    columns: Array<{ id: string; label: string }>;
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    visibleColumns: string[];
    isLoading?: boolean;
    emptyMessage?: string;
  }>(),
  { isLoading: false, emptyMessage: 'No data available' },
);

// rich cells (badges, action menus) come from `cell-<id>` scoped slots on the parent
const slots = useSlots();
const visible = computed(() => props.columns.filter((c) => props.visibleColumns.includes(c.id)));
</script>

<template>
  <div
    v-if="isLoading"
    class="border-wds-accent/30 bg-wds-background rounded-2xl border p-8 text-center"
  >
    <div class="text-wds-text/70">Đang tải...</div>
  </div>
  <div
    v-else-if="data.length === 0"
    class="border-wds-accent/30 bg-wds-background rounded-2xl border p-8 text-center"
  >
    <div class="text-wds-text/70">{{ emptyMessage }}</div>
  </div>
  <div
    v-else
    class="border-wds-accent/30 bg-wds-background shadow-wds-accent/10 rounded-2xl border"
  >
    <Table>
      <TableHeader>
        <TableRow class="border-wds-accent/20 hover:bg-wds-accent/5">
          <TableHead v-for="column in visible" :key="column.id" class="text-wds-text font-semibold">
            {{ column.label }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="(row, rowIndex) in data"
          :key="rowIndex"
          class="border-wds-accent/20 hover:bg-wds-accent/10 transition-colors"
        >
          <TableCell v-for="column in visible" :key="column.id" class="text-wds-text/90">
            <slot v-if="slots['cell-' + column.id]" :name="'cell-' + column.id" :row="row" />
            <template v-else>{{ row[column.id] }}</template>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
