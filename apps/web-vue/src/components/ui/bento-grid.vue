<script lang="ts">
import { ArrowRight as ArrowRightIcon } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import { defineComponent, h, type VNode } from 'vue';

import { Button } from '@/components/ui/button.vue';
import { cn } from 'cn';

export const BentoGrid = function (props: any, { attrs, slots }: any): VNode {
  return h(
    'div',
    { ...attrs, class: cn('grid w-full auto-rows-88 grid-cols-3 gap-4', attrs.class) },
    slots.default?.(),
  );
};

export const BentoCard = defineComponent({
  name: 'BentoCard',
  inheritAttrs: false,
  props: {
    name: { type: String, required: true },
    className: { type: String, default: '' },
    background: { type: [Object, Function], default: null },
    Icon: { type: [Object, Function], required: true },
    description: { type: String, required: true },
    href: { type: String, default: undefined },
    cta: { type: String, default: undefined },
    onClick: { type: Function, default: undefined },
  },
  setup(props, { attrs }) {
    function renderCta() {
      if (!props.cta) return null;
      const label = [props.cta, h(ArrowRightIcon, { class: 'ms-2 h-4 w-4 rtl:rotate-180' })];
      if (props.onClick) {
        return h(
          Button as any,
          {
            variant: 'link',
            size: 'sm',
            class: 'pointer-events-auto p-0',
            onClick: props.onClick,
          },
          () => label,
        );
      }
      return h(
        Button as any,
        { variant: 'link', size: 'sm', class: 'pointer-events-auto p-0', asChild: true },
        () => h(RouterLink as any, { to: props.href as any }, () => label),
      );
    }

    return () =>
      h(
        'div',
        {
          class: cn(
            'group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl',
            'bg-white text-neutral-900 [box-shadow:0_0_0_1px_rgba(0,0,0,.04),0_2px_6px_rgba(0,0,0,.05),0_16px_32px_rgba(0,0,0,.06)]',
            'transform-gpu',
            props.className,
            attrs.class,
          ),
        },
        [
          h(
            'div',
            {
              class:
                'pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100',
            },
            [
              typeof props.background === 'function'
                ? (props.background as any)()
                : props.background,
            ],
          ),
          h('div', { class: 'relative z-10 p-4' }, [
            h(
              'div',
              {
                class:
                  'pointer-events-none flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-hover:-translate-y-10',
              },
              [
                h(props.Icon as any, {
                  class:
                    'h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75',
                }),
                h('h3', { class: 'text-xl font-semibold text-neutral-900' }, props.name),
                h('p', { class: 'max-w-lg text-neutral-600' }, props.description),
              ],
            ),
            h(
              'div',
              {
                class:
                  'pointer-events-none flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:hidden',
              },
              [renderCta()],
            ),
          ]),
          h(
            'div',
            {
              class:
                'pointer-events-none absolute bottom-0 hidden w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex',
            },
            [renderCta()],
          ),
          h('div', {
            class:
              'pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/3',
          }),
        ],
      );
  },
});

export default BentoGrid;
</script>
