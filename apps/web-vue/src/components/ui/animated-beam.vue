<script lang="ts">
import { motion } from 'motion-v';
import { defineComponent, h, onBeforeUnmount, onMounted, ref, type PropType, type Ref } from 'vue';

import { cn } from '@/lib/cn';

let uid = 0;

type ElRef = Ref<HTMLElement | null> | HTMLElement | null;
const resolve = (r: ElRef): HTMLElement | null =>
  r && typeof r === 'object' && 'value' in r ? r.value : (r as HTMLElement | null);

export const AnimatedBeam = defineComponent({
  name: 'AnimatedBeam',
  props: {
    containerRef: { type: [Object, Function] as PropType<ElRef>, default: null },
    fromRef: { type: [Object, Function] as PropType<ElRef>, default: null },
    toRef: { type: [Object, Function] as PropType<ElRef>, default: null },
    curvature: { type: Number, default: 0 },
    reverse: { type: Boolean, default: false },
    pathColor: { type: String, default: 'gray' },
    pathWidth: { type: Number, default: 2 },
    pathOpacity: { type: Number, default: 0.2 },
    gradientStartColor: { type: String, default: '#ffaa40' },
    gradientStopColor: { type: String, default: '#9c40ff' },
    delay: { type: Number, default: 0 },
    duration: { type: Number, default: undefined },
    startXOffset: { type: Number, default: 0 },
    startYOffset: { type: Number, default: 0 },
    endXOffset: { type: Number, default: 0 },
    endYOffset: { type: Number, default: 0 },
  },
  setup(props, { attrs }) {
    const id = `animated-beam-${uid++}`;
    const pathD = ref('');
    const width = ref(0);
    const height = ref(0);
    const duration = props.duration ?? Math.random() * 3 + 4;

    const coords = () =>
      props.reverse
        ? { x1: ['90%', '-10%'], x2: ['100%', '0%'], y1: ['0%', '0%'], y2: ['0%', '0%'] }
        : { x1: ['10%', '110%'], x2: ['0%', '100%'], y1: ['0%', '0%'], y2: ['0%', '0%'] };

    let ro: ResizeObserver | null = null;
    const updatePath = () => {
      const c = resolve(props.containerRef);
      const a = resolve(props.fromRef);
      const b = resolve(props.toRef);
      if (!c || !a || !b) return;
      const cr = c.getBoundingClientRect();
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      width.value = cr.width;
      height.value = cr.height;
      const startX = ra.left - cr.left + ra.width / 2 + props.startXOffset;
      const startY = ra.top - cr.top + ra.height / 2 + props.startYOffset;
      const endX = rb.left - cr.left + rb.width / 2 + props.endXOffset;
      const endY = rb.top - cr.top + rb.height / 2 + props.endYOffset;
      const controlY = startY - props.curvature;
      pathD.value = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`;
    };

    onMounted(() => {
      ro = new ResizeObserver(updatePath);
      const container = resolve(props.containerRef);
      if (container) ro.observe(container);
      updatePath();
    });
    onBeforeUnmount(() => ro?.disconnect());

    return () => {
      const { x1, x2, y1, y2 } = coords();
      return h(
        'svg',
        {
          fill: 'none',
          width: width.value,
          height: height.value,
          xmlns: 'http://www.w3.org/2000/svg',
          class: cn(
            'pointer-events-none absolute top-0 left-0 transform-gpu stroke-2',
            attrs.class,
          ),
          viewBox: `0 0 ${width.value} ${height.value}`,
        },
        [
          h('path', {
            d: pathD.value,
            stroke: props.pathColor,
            'stroke-width': props.pathWidth,
            'stroke-opacity': props.pathOpacity,
            'stroke-linecap': 'round',
          }),
          h('path', {
            d: pathD.value,
            'stroke-width': props.pathWidth,
            stroke: `url(#${id})`,
            'stroke-opacity': '1',
            'stroke-linecap': 'round',
          }),
          h('defs', null, [
            h(
              motion.linearGradient,
              {
                class: 'transform-gpu',
                id,
                gradientUnits: 'userSpaceOnUse',
                initial: { x1: '0%', x2: '0%', y1: '0%', y2: '0%' },
                animate: { x1, x2, y1, y2 },
                transition: {
                  delay: props.delay,
                  duration,
                  ease: [0.16, 1, 0.3, 1],
                  repeat: Infinity,
                  repeatDelay: 0,
                },
              },
              () => [
                h('stop', { 'stop-color': props.gradientStartColor, 'stop-opacity': '0' }),
                h('stop', { 'stop-color': props.gradientStartColor }),
                h('stop', { offset: '32.5%', 'stop-color': props.gradientStopColor }),
                h('stop', {
                  offset: '100%',
                  'stop-color': props.gradientStopColor,
                  'stop-opacity': '0',
                }),
              ],
            ),
          ]),
        ],
      );
    };
  },
});

export default AnimatedBeam;
</script>
