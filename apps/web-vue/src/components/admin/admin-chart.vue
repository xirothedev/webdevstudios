<script lang="ts">
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
);
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar, Line } from 'vue-chartjs';

import type { ChartOptions } from 'chart.js';

import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart.vue';
import { cn } from '@/lib/cn';

// mirrors apps/web AdminChart (recharts area/bar → chart.js line-with-fill / bar)
const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    data: Array<Record<string, string | number>>;
    dataKey: string;
    type?: 'area' | 'bar';
    class?: string;
  }>(),
  { type: 'area' },
);

const chartConfig = computed<ChartConfig>(() => ({
  [props.dataKey]: { label: props.title, color: '#F7931E' },
}));

const chartData = computed(() => ({
  labels: props.data.map((d) => String(d.name)),
  datasets: [
    {
      label: props.dataKey,
      data: props.data.map((d) => Number(d[props.dataKey])),
      borderColor: '#F7931E',
      backgroundColor:
        props.type === 'area'
          ? 'rgba(247, 147, 30, 0.15)'
          : '#F7931E' /* recharts gradient → flat fill */,
      fill: props.type === 'area',
      tension: 0.4 /* recharts type="monotone" */,
      borderRadius: 8 /* recharts radius={[8,8,0,0]} */,
    },
  ],
}));

// ponytail: not a computed — all props here are static literals at the call sites.
// Cast at the seam: the ChartTooltip factory in ui/chart.vue (not owned by this slice)
// types colors string|undefined, which chart.js ChartOptions rejects.
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: ChartTooltip(chartConfig.value, {
      formatter: (value: number) =>
        props.dataKey === 'revenue'
          ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
          : value.toLocaleString('vi-VN'),
    }),
  },
  scales: {
    x: {
      grid: { display: false /* CartesianGrid vertical={false} */ },
      ticks: { color: 'rgba(255, 255, 255, 0.7)' },
      border: { color: 'rgba(255, 255, 255, 0.1)' },
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.1)', tickBorderDash: [3, 3] },
      border: { dash: [3, 3], color: 'rgba(255, 255, 255, 0.1)' },
      ticks: { color: 'rgba(255, 255, 255, 0.7)' },
    },
  },
};

const lineOptions = options as ChartOptions<'line'>;
const barOptions = options as ChartOptions<'bar'>;
</script>

<template>
  <div
    :class="
      cn(
        'border-wds-accent/30 bg-wds-background/80 shadow-wds-accent/10 hover:shadow-wds-accent/20 rounded-2xl border p-6 backdrop-blur-xl transition-shadow duration-200',
        props.class,
      )
    "
  >
    <div class="mb-4">
      <h3 class="text-wds-text text-lg font-semibold">{{ title }}</h3>
      <p v-if="description" class="text-wds-text/70 mt-1 text-sm">{{ description }}</p>
    </div>
    <ChartContainer :config="chartConfig" class="relative h-[300px] w-full">
      <Line v-if="type === 'area'" :data="chartData" :options="lineOptions" />
      <Bar v-else :data="chartData" :options="barOptions" />
    </ChartContainer>
  </div>
</template>
