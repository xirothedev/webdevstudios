<script lang="ts">
import { h, type VNode } from 'vue';

import { cn } from '@/lib/cn';

function el(tag: any, base: string, slot: string) {
  return function (props: any, { attrs, slots }: any): VNode {
    return h(tag, { ...attrs, 'data-slot': slot, class: cn(base, attrs.class) }, slots.default?.());
  };
}

export function Table(props: any, { attrs, slots }: any): VNode {
  return h('div', { 'data-slot': 'table-container', class: 'relative w-full overflow-x-auto' }, [
    h(
      'table',
      { ...attrs, 'data-slot': 'table', class: cn('w-full caption-bottom text-sm', attrs.class) },
      slots.default?.(),
    ),
  ]);
}

export const TableHeader = el('thead', '[&_tr]:border-b', 'table-header');
export const TableBody = el('tbody', '[&_tr:last-child]:border-0', 'table-body');
export const TableFooter = el(
  'tfoot',
  'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
  'table-footer',
);
export const TableRow = el(
  'tr',
  'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
  'table-row',
);
export const TableHead = el(
  'th',
  'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-[2px]',
  'table-head',
);
export const TableCell = el(
  'td',
  'p-2 align-middle whitespace-nowrap has-[[role=checkbox]]:pr-0 *:[[role=checkbox]]:translate-y-[2px]',
  'table-cell',
);
export const TableCaption = el('caption', 'text-muted-foreground mt-4 text-sm', 'table-caption');

export default Table;
</script>
