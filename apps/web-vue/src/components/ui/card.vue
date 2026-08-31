<script lang="ts">
import { h, type VNode } from 'vue';

import { cn } from '@/lib/cn';

function el(tag: any, base: string, slot: string) {
  return function (props: any, { attrs, slots }: any): VNode {
    return h(tag, { ...attrs, 'data-slot': slot, class: cn(base, attrs.class) }, slots.default?.());
  };
}

export const Card = el(
  'div',
  'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
  'card',
);
export const CardHeader = el(
  'div',
  '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
  'card-header',
);
export const CardTitle = el('div', 'leading-none font-semibold', 'card-title');
export const CardDescription = el('div', 'text-muted-foreground text-sm', 'card-description');
export const CardAction = el(
  'div',
  'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
  'card-action',
);
export const CardContent = el('div', 'px-6', 'card-content');
export const CardFooter = el('div', 'flex items-center px-6 [.border-t]:pt-6', 'card-footer');

export default Card;
</script>
