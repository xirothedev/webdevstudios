<script lang="ts">
import { CountUp } from 'countup.js';
import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { cn } from '@/lib/cn';

// ponytail: countup.js owns the in-view + easing + i18n grouping that the React
// version hand-rolled with motion's useSpring/useInView. Upgrade path: motion-v if a
// non-count magicui animation is ever needed here.
export const NumberTicker = defineComponent({
  name: 'NumberTicker',
  props: {
    value: { type: Number, required: true },
    startValue: { type: Number, default: 0 },
    direction: { type: String as () => 'up' | 'down', default: 'up' },
    delay: { type: Number, default: 0 },
    decimalPlaces: { type: Number, default: 0 },
  },
  setup(props, { attrs }) {
    const el = ref<HTMLSpanElement | null>(null);
    let countUp: CountUp | null = null;
    const endVal = () => (props.direction === 'down' ? props.startValue : props.value);
    const startVal = () => (props.direction === 'down' ? props.value : props.startValue);

    onMounted(() => {
      if (!el.value) return;
      countUp = new CountUp(el.value, endVal(), {
        startVal: startVal(),
        duration: 2,
        delay: props.delay,
        decimalPlaces: props.decimalPlaces,
      } as any);
      if (!countUp.error) countUp.start();
    });

    watch(
      () => props.value,
      () => {
        if (countUp) countUp.update(endVal());
      },
    );

    onBeforeUnmount(() => countUp?.reset());

    return () =>
      h(
        'span',
        {
          ref: el,
          'data-slot': 'number-ticker',
          class: cn('inline-block tracking-wider text-black tabular-nums', attrs.class),
        },
        String(props.startValue),
      );
  },
});

export default NumberTicker;
</script>
