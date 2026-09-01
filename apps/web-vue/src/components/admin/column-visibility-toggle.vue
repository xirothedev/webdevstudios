<script setup lang="ts">
import { Columns3 } from 'lucide-vue-next';

import Button from '@/components/ui/button.vue';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.vue';

const props = defineProps<{
  columns: Array<{ id: string; label: string }>;
  modelValue: string[];
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>();

function toggleColumn(columnId: string) {
  emit(
    'update:modelValue',
    props.modelValue.includes(columnId)
      ? props.modelValue.filter((id) => id !== columnId)
      : [...props.modelValue, columnId],
  );
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10"
      >
        <Columns3 class="h-4 w-4" />
        Columns
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      class="border-wds-accent/30 bg-wds-background text-wds-text w-48"
    >
      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
      <DropdownMenuSeparator class="bg-wds-accent/20" />
      <DropdownMenuCheckboxItem
        v-for="column in columns"
        :key="column.id"
        :checked="modelValue.includes(column.id)"
        class="focus:bg-wds-accent/10 focus:text-wds-text"
        @select="toggleColumn(column.id)"
      >
        {{ column.label }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
