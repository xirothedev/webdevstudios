<script setup lang="ts">
import { Eye, Ellipsis, Pencil, Trash2 } from 'lucide-vue-next';

import Button from '@/components/ui/button.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.vue';

// Ellipsis replaces MoreHorizontal (lucide renamed it).
defineProps<{
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  customActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  }>;
}>();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="hover:bg-wds-accent/10 h-8 w-8 p-0">
        <span class="sr-only">Open menu</span>
        <Ellipsis class="text-wds-text h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="border-wds-accent/30 bg-wds-background text-wds-text">
      <DropdownMenuItem
        v-if="onView"
        class="focus:bg-wds-accent/10 focus:text-wds-text"
        @select="onView?.()"
      >
        <Eye class="mr-2 h-4 w-4" />
        View
      </DropdownMenuItem>
      <DropdownMenuItem
        v-if="onEdit"
        class="focus:bg-wds-accent/10 focus:text-wds-text"
        @select="onEdit?.()"
      >
        <Pencil class="mr-2 h-4 w-4" />
        Edit
      </DropdownMenuItem>
      <template v-if="customActions && customActions.length > 0">
        <DropdownMenuSeparator class="bg-wds-accent/20" />
        <DropdownMenuItem
          v-for="(action, index) in customActions"
          :key="index"
          :variant="action.variant"
          class="focus:bg-wds-accent/10 focus:text-wds-text"
          @select="action.onClick()"
        >
          {{ action.label }}
        </DropdownMenuItem>
      </template>
      <template v-if="onDelete">
        <DropdownMenuSeparator class="bg-wds-accent/20" />
        <DropdownMenuItem
          variant="destructive"
          class="focus:bg-destructive/10 focus:text-destructive"
          @select="onDelete?.()"
        >
          <Trash2 class="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
