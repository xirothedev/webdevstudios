'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface AdminChartProps {
  title: string;
  description?: string;
  data: Array<Record<string, string | number>>;
  dataKey: string;
  type?: 'area' | 'bar';
  className?: string;
}

export function AdminChart({
  title,
  description,
  data,
  dataKey,
  type = 'area',
  className,
}: AdminChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: '#F7931E', // WDS orange accent
    },
  } satisfies ChartConfig;

  return (
    <div
      className={`border-wds-accent/30 bg-wds-background/80 shadow-wds-accent/10 hover:shadow-wds-accent/20 rounded-2xl border p-6 backdrop-blur-xl transition-shadow duration-200 ${className || ''}`}
    >
      <div className="mb-4">
        <h3 className="text-wds-text text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-wds-text/70 mt-1 text-sm">{description}</p>
        )}
      </div>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        {type === 'area' ? (
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <defs>
              <linearGradient
                id={`fill-${dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#F7931E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F7931E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
              tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="border-wds-accent/30 bg-wds-background/95 text-wds-text backdrop-blur-md"
                  formatter={(value) => {
                    if (typeof value === 'number') {
                      // Format revenue as currency
                      if (dataKey === 'revenue') {
                        return new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(value);
                      }
                      // Format other numbers
                      return value.toLocaleString('vi-VN');
                    }
                    return value;
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#F7931E"
              strokeWidth={2}
              fill={`url(#fill-${dataKey})`}
            />
          </AreaChart>
        ) : (
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
              tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="border-wds-accent/30 bg-wds-background/95 text-wds-text backdrop-blur-md"
                  formatter={(value) => {
                    if (typeof value === 'number') {
                      // Format revenue as currency
                      if (dataKey === 'revenue') {
                        return new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(value);
                      }
                      // Format other numbers
                      return value.toLocaleString('vi-VN');
                    }
                    return value;
                  }}
                />
              }
            />
            <Bar dataKey={dataKey} fill="#F7931E" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}
      </ChartContainer>
    </div>
  );
}
