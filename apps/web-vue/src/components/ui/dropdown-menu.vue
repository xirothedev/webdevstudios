<script lang="ts">
import {
  DropdownMenuCheckboxItem as CheckboxItemPrimitive,
  DropdownMenuContent as ContentPrimitive,
  DropdownMenuGroup as GroupPrimitive,
  DropdownMenuItem as ItemPrimitive,
  DropdownMenuItemIndicator as ItemIndicatorPrimitive,
  DropdownMenuLabel as LabelPrimitive,
  DropdownMenuPortal as PortalPrimitive,
  DropdownMenuRadioGroup as RadioGroupPrimitive,
  DropdownMenuRadioItem as RadioItemPrimitive,
  DropdownMenuRoot as RootPrimitive,
  DropdownMenuSeparator as SeparatorPrimitive,
  DropdownMenuSub as SubPrimitive,
  DropdownMenuSubContent as SubContentPrimitive,
  DropdownMenuSubTrigger as SubTriggerPrimitive,
  DropdownMenuTrigger as TriggerPrimitive,
} from 'reka-ui';
import {
  Check as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Circle as CircleIcon,
} from 'lucide-vue-next';
import { h, type VNode } from 'vue';

import { cn } from '@/lib/cn';

function el(tag: any, base: string | undefined, slot: string) {
  return function (props: any, { attrs, slots }: any): VNode {
    return h(tag, { ...attrs, 'data-slot': slot, class: cn(base, attrs.class) }, slots.default?.());
  };
}

export const DropdownMenu = el(RootPrimitive, undefined, 'dropdown-menu');
export const DropdownMenuPortal = el(PortalPrimitive, undefined, 'dropdown-menu-portal');
export const DropdownMenuTrigger = el(TriggerPrimitive, undefined, 'dropdown-menu-trigger');
export const DropdownMenuGroup = el(GroupPrimitive, undefined, 'dropdown-menu-group');
export const DropdownMenuRadioGroup = el(
  RadioGroupPrimitive,
  undefined,
  'dropdown-menu-radio-group',
);
export const DropdownMenuSub = el(SubPrimitive, undefined, 'dropdown-menu-sub');
export const DropdownMenuSeparator = el(
  SeparatorPrimitive,
  'bg-border -mx-1 my-1 h-px',
  'dropdown-menu-separator',
);
export const DropdownMenuSubContent = el(
  SubContentPrimitive,
  'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 origin-(--reka-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg',
  'dropdown-menu-sub-content',
);

export function DropdownMenuContent(props: any, { attrs, slots }: any): VNode {
  return h(PortalPrimitive, null, [
    h(
      ContentPrimitive,
      {
        ...attrs,
        sideOffset: attrs.sideOffset ?? 4,
        'data-slot': 'dropdown-menu-content',
        class: cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--reka-dropdown-menu-content-available-height) min-w-32 origin-(--reka-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
          attrs.class,
        ),
      },
      slots.default?.(),
    ),
  ]);
}

export function DropdownMenuItem(props: any, { attrs, slots }: any): VNode {
  return h(
    ItemPrimitive,
    {
      ...attrs,
      'data-slot': 'dropdown-menu-item',
      'data-inset': attrs.inset,
      'data-variant': attrs.variant ?? 'default',
      class: cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive! [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        attrs.class,
      ),
    },
    slots.default?.(),
  );
}

export function DropdownMenuCheckboxItem(props: any, { attrs, slots }: any): VNode {
  return h(
    CheckboxItemPrimitive,
    {
      ...attrs,
      'data-slot': 'dropdown-menu-checkbox-item',
      class: cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        attrs.class,
      ),
    },
    [
      h(
        'span',
        { class: 'pointer-events-none absolute left-2 flex size-3.5 items-center justify-center' },
        [h(ItemIndicatorPrimitive, null, () => h(CheckIcon, { class: 'size-4' }))],
      ),
      slots.default?.(),
    ],
  );
}

export function DropdownMenuRadioItem(props: any, { attrs, slots }: any): VNode {
  return h(
    RadioItemPrimitive,
    {
      ...attrs,
      'data-slot': 'dropdown-menu-radio-item',
      class: cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        attrs.class,
      ),
    },
    [
      h(
        'span',
        { class: 'pointer-events-none absolute left-2 flex size-3.5 items-center justify-center' },
        [h(ItemIndicatorPrimitive, null, () => h(CircleIcon, { class: 'size-2 fill-current' }))],
      ),
      slots.default?.(),
    ],
  );
}

export function DropdownMenuLabel(props: any, { attrs, slots }: any): VNode {
  return h(
    LabelPrimitive,
    {
      ...attrs,
      'data-slot': 'dropdown-menu-label',
      'data-inset': attrs.inset,
      class: cn('px-2 py-1.5 text-sm font-medium data-inset:pl-8', attrs.class),
    },
    slots.default?.(),
  );
}

export function DropdownMenuShortcut(props: any, { attrs, slots }: any): VNode {
  return h(
    'span',
    {
      ...attrs,
      'data-slot': 'dropdown-menu-shortcut',
      class: cn('text-muted-foreground ml-auto text-xs tracking-widest', attrs.class),
    },
    slots.default?.(),
  );
}

export function DropdownMenuSubTrigger(props: any, { attrs, slots }: any): VNode {
  return h(
    SubTriggerPrimitive,
    {
      ...attrs,
      'data-slot': 'dropdown-menu-sub-trigger',
      'data-inset': attrs.inset,
      class: cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        attrs.class,
      ),
    },
    [slots.default?.(), h(ChevronRightIcon, { class: 'ml-auto size-4' })],
  );
}

export default DropdownMenu;
</script>
