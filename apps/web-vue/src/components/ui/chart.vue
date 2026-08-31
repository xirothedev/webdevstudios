<script lang="ts">
// ponytail: chart.js renders tooltips/legends on <canvas>, not as React children, so
// ChartTooltip/ChartLegend are NOT drop-in recharts components here — they are factories
// that return chart.js `options.plugins.{tooltip,legend}` objects styled to match. The
// HTML renderers (ChartTooltipContent/ChartLegendContent) stay for external HTML legends.
import {
  defineComponent,
  h,
  inject,
  provide,
  type InjectionKey,
  type PropType,
  type VNode,
} from 'vue';

import { cn } from '@/lib/cn';

const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfigItem = {
  label?: string;
  icon?: any;
  color?: string;
  theme?: Partial<Record<keyof typeof THEMES, string>>;
};
export type ChartConfig = Record<string, ChartConfigItem>;

const ChartKey: InjectionKey<{ config: ChartConfig }> = Symbol('chart');

function useChart(): { config: ChartConfig } {
  const ctx = inject(ChartKey, undefined as unknown as { config: ChartConfig });
  if (!ctx) throw new Error('useChart must be used within <ChartContainer>');
  return ctx;
}

export function ChartStyle(props: { id: string; config: ChartConfig }): VNode | null {
  const colorConfig = Object.entries(props.config).filter(([, c]) => c.theme || c.color);
  if (!colorConfig.length) return null;
  return h('style', {
    innerHTML: Object.entries(THEMES)
      .map(
        ([theme, prefix]) => `
${prefix} [data-chart=${props.id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof THEMES] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join('\n')}
}
`,
      )
      .join('\n'),
  });
}

export const ChartContainer = defineComponent({
  name: 'ChartContainer',
  inheritAttrs: false,
  props: {
    id: { type: String, default: undefined },
    config: { type: Object as PropType<ChartConfig>, required: true },
  },
  setup(props, { attrs, slots }) {
    const chartId = `chart-${props.id || Math.random().toString(36).slice(2, 8)}`;
    provide(ChartKey, { config: props.config });
    return () =>
      h(
        'div',
        {
          ...attrs,
          'data-slot': 'chart',
          'data-chart': chartId,
          class: cn(
            "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
            attrs.class,
          ),
        },
        [h(ChartStyle, { id: chartId, config: props.config }), slots.default?.()],
      );
  },
});

type PayloadItem = {
  dataKey?: string;
  name?: string;
  value?: unknown;
  color?: string;
  fill?: string;
  label?: string;
  payload?: Record<string, unknown>;
};

function getConfig(
  config: ChartConfig,
  item: PayloadItem,
  key: string,
): ChartConfigItem | undefined {
  const p = item.payload as Record<string, unknown> | undefined;
  let labelKey = key;
  if (key in (item as object) && typeof (item as any)[key] === 'string') {
    labelKey = (item as any)[key];
  } else if (p && key in p && typeof p[key] === 'string') {
    labelKey = p[key] as string;
  }
  return config[labelKey] ?? config[key];
}

export const ChartTooltipContent = defineComponent({
  name: 'ChartTooltipContent',
  inheritAttrs: false,
  props: {
    payload: { type: Array as PropType<PayloadItem[]>, default: () => [] },
    label: { type: String, default: undefined },
    hideLabel: { type: Boolean, default: false },
    hideIndicator: { type: Boolean, default: false },
    indicator: { type: String as PropType<'line' | 'dot' | 'dashed'>, default: 'dot' },
    labelKey: { type: String, default: undefined },
    nameKey: { type: String, default: undefined },
    color: { type: String, default: undefined },
    active: { type: Boolean, default: true },
    labelFormatter: {
      type: Function as PropType<(value: unknown, payload: PayloadItem[]) => unknown>,
      default: undefined,
    },
    formatter: {
      type: Function as PropType<(value: unknown, item: PayloadItem, index: number) => unknown>,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    return () => {
      const { config } = useChart();
      if (!props.active || !props.payload?.length) return null;
      const nestLabel = props.payload.length === 1 && props.indicator !== 'dot';

      const labelKey =
        props.labelKey || props.payload[0]?.dataKey || props.payload[0]?.name || 'value';
      const labelConfig = getConfig(config, props.payload[0] as PayloadItem, labelKey);
      const labelValue =
        !props.labelKey && props.label
          ? config[props.label]?.label || props.label
          : labelConfig?.label;
      const tooltipLabel =
        props.hideLabel || !props.payload.length
          ? null
          : h(
              'div',
              { class: cn('font-medium') },
              props.labelFormatter
                ? String(props.labelFormatter(labelValue, props.payload))
                : String(labelValue ?? ''),
            );

      return h(
        'div',
        {
          ...attrs,
          class: cn(
            'border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl',
            attrs.class,
          ),
        },
        [
          nestLabel ? null : tooltipLabel,
          h(
            'div',
            { class: 'grid gap-1.5' },
            props.payload.map((item, index) => {
              const key = props.nameKey || item.name || item.dataKey || 'value';
              const itemConfig = getConfig(config, item, key);
              const indicatorColor = props.color || item.fill || item.color;
              return h(
                'div',
                {
                  key,
                  class: cn(
                    '[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5',
                    props.indicator === 'dot' && 'items-center',
                  ),
                },
                [
                  itemConfig?.icon
                    ? h(itemConfig.icon)
                    : !props.hideIndicator
                      ? h('div', {
                          class: cn('border-border shrink-0 rounded-[2px] bg-(--color-bg)', {
                            'h-2.5 w-2.5': props.indicator === 'dot',
                            'w-1': props.indicator === 'line',
                            'w-0 border-[1.5px] border-dashed bg-transparent':
                              props.indicator === 'dashed',
                            'my-0.5': nestLabel && props.indicator === 'dashed',
                          }),
                          style: {
                            '--color-bg': indicatorColor,
                            '--color-border': indicatorColor,
                          } as any,
                        })
                      : null,
                  h(
                    'div',
                    {
                      class: cn(
                        'flex flex-1 justify-between leading-none',
                        nestLabel ? 'items-end' : 'items-center',
                      ),
                    },
                    [
                      h('div', { class: 'grid gap-1.5' }, [
                        nestLabel ? tooltipLabel : null,
                        h(
                          'span',
                          { class: 'text-muted-foreground' },
                          itemConfig?.label || item.name,
                        ),
                      ]),
                      item.value != null
                        ? h(
                            'span',
                            { class: 'text-foreground font-mono font-medium tabular-nums' },
                            props.formatter
                              ? String(props.formatter(item.value, item, index))
                              : (String(item.value).toLocaleString?.() ?? String(item.value)),
                          )
                        : null,
                    ],
                  ),
                ],
              );
            }),
          ),
        ],
      );
    };
  },
});

export const ChartLegendContent = defineComponent({
  name: 'ChartLegendContent',
  inheritAttrs: false,
  props: {
    payload: { type: Array as PropType<PayloadItem[]>, default: () => [] },
    hideIcon: { type: Boolean, default: false },
    nameKey: { type: String, default: undefined },
    verticalAlign: { type: String as PropType<'top' | 'bottom'>, default: 'bottom' },
  },
  setup(props, { attrs }) {
    return () => {
      const { config } = useChart();
      if (!props.payload?.length) return null;
      return h(
        'div',
        {
          ...attrs,
          class: cn(
            'flex items-center justify-center gap-4',
            props.verticalAlign === 'top' ? 'pb-3' : 'pt-3',
            attrs.class,
          ),
        },
        props.payload.map((item) => {
          const key = props.nameKey || item.dataKey || 'value';
          const itemConfig = getConfig(config, item, key);
          return h(
            'div',
            {
              key: String(item.value ?? key),
              class:
                'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground',
            },
            [
              itemConfig?.icon && !props.hideIcon
                ? h(itemConfig.icon)
                : h('div', {
                    class: 'h-2 w-2 shrink-0 rounded-[2px]',
                    style: { backgroundColor: item.color },
                  }),
              itemConfig?.label,
            ],
          );
        }),
      );
    };
  },
});

export function ChartTooltip(
  config: ChartConfig,
  opts: {
    formatter?: (value: number, item: { datasetLabel: string }, index: number) => string;
  } = {},
) {
  return {
    backgroundColor: 'hsl(var(--popover))',
    titleColor: 'hsl(var(--popover-foreground))',
    bodyColor: 'hsl(var(--popover-foreground))',
    borderColor: 'hsl(var(--border))',
    borderWidth: 1,
    padding: 8,
    callbacks: {
      labelColor: (ctx: any) => {
        const key = ctx.dataset.label as string;
        const color = config[key]?.color || Object.values(config)[0]?.color;
        return { borderColor: color, backgroundColor: color };
      },
      label: (ctx: any) => {
        const label = config[ctx.dataset.label]?.label ?? ctx.dataset.label;
        const raw = ctx.parsed.y as number;
        return opts.formatter
          ? ` ${label}: ${opts.formatter(raw, { datasetLabel: ctx.dataset.label }, ctx.dataIndex)}`
          : ` ${label}: ${raw.toLocaleString('vi-VN')}`;
      },
    },
  };
}

export function ChartLegend(config: ChartConfig, opts: { display?: boolean } = { display: true }) {
  return {
    display: opts.display ?? true,
    position: 'bottom' as const,
    labels: {
      usePointStyle: true,
      boxWidth: 8,
      boxHeight: 8,
      generateLabels: (chart: any) =>
        chart.data.datasets.map((ds: any, i: number) => {
          const key = ds.label as string;
          return {
            text: config[key]?.label ?? key,
            fillStyle: ds.backgroundColor ?? ds.borderColor,
            strokeStyle: ds.borderColor,
            hidden: !chart.isDatasetVisible(i),
            datasetIndex: i,
          };
        }),
    },
  };
}

export { useChart };
export default ChartContainer;
</script>
