<script lang="ts">
import { cva } from 'class-variance-authority';
import { ChevronDown as ChevronDownIcon } from 'lucide-vue-next';
import {
  NavigationMenuContent as ContentPrimitive,
  NavigationMenuIndicator as IndicatorPrimitive,
  NavigationMenuItem as ItemPrimitive,
  NavigationMenuLink as LinkPrimitive,
  NavigationMenuList as ListPrimitive,
  NavigationMenuRoot as RootPrimitive,
  NavigationMenuTrigger as TriggerPrimitive,
  NavigationMenuViewport as ViewportPrimitive,
} from 'reka-ui';
import { h, type VNode } from 'vue';

import { cn } from 'cn';

function el(tag: any, base: string | undefined, slot: string) {
  return function (props: any, { attrs, slots }: any): VNode {
    return h(tag, { ...attrs, 'data-slot': slot, class: cn(base, attrs.class) }, slots.default?.());
  };
}

export function NavigationMenu(props: any, { attrs, slots }: any): VNode {
  return h(
    RootPrimitive,
    {
      ...attrs,
      'data-slot': 'navigation-menu',
      'data-viewport': props.viewport,
      class: cn(
        'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
        attrs.class,
      ),
    },
    [slots.default?.(), props.viewport ? h(NavigationMenuViewport) : null],
  );
}
NavigationMenu.props = { viewport: { type: Boolean, default: true } };

export const NavigationMenuList = el(
  ListPrimitive,
  'group flex flex-1 list-none items-center justify-center gap-1',
  'navigation-menu-list',
);
export const NavigationMenuItem = el(ItemPrimitive, 'relative', 'navigation-menu-item');

export const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-transparent focus:bg-transparent focus:text-black disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-transparent data-[state=open]:text-black data-[state=open]:focus:bg-transparent data-[state=open]:bg-transparent focus-visible:ring-ring/50 outline-none transition-colors focus-visible:ring-[3px] focus-visible:outline-1',
);

export function NavigationMenuTrigger(props: any, { attrs, slots }: any): VNode {
  return h(
    TriggerPrimitive,
    {
      ...attrs,
      'data-slot': 'navigation-menu-trigger',
      class: cn(navigationMenuTriggerStyle(), 'group', attrs.class),
    },
    [
      slots.default?.(),
      ' ',
      h(ChevronDownIcon, {
        class:
          'relative top-px ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180',
        'aria-hidden': 'true',
      }),
    ],
  );
}

export const NavigationMenuContent = el(
  ContentPrimitive,
  'data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:border-gray-200 group-data-[viewport=false]/navigation-menu:bg-white group-data-[viewport=false]/navigation-menu:text-black group-data-[viewport=false]/navigation-menu:shadow-lg group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none',
  'navigation-menu-content',
);

export function NavigationMenuViewport(props: any, { attrs }: any): VNode {
  return h('div', { class: cn('absolute top-full left-0 isolate z-50 flex justify-center') }, [
    h(
      ViewportPrimitive,
      {
        ...attrs,
        'data-slot': 'navigation-menu-viewport',
        class: cn(
          'origin-top-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-(--reka-navigation-menu-viewport-height) w-full overflow-hidden rounded-md border border-gray-200 bg-white text-black shadow-lg md:w-(--reka-navigation-menu-viewport-width)',
          attrs.class,
        ),
      },
      undefined,
    ),
  ]);
}

export const NavigationMenuLink = el(
  LinkPrimitive,
  "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
  'navigation-menu-link',
);

export function NavigationMenuIndicator(props: any, { attrs }: any): VNode {
  return h(
    IndicatorPrimitive,
    {
      ...attrs,
      'data-slot': 'navigation-menu-indicator',
      class: cn(
        'data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-1 flex h-1.5 items-end justify-center overflow-hidden',
        attrs.class,
      ),
    },
    [h('div', { class: 'bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md' })],
  );
}

export default NavigationMenu;
</script>
