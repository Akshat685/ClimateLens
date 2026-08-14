'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import type { WeatherPoint } from '@/lib/weather';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(value),
  );
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface-raised px-3.5 py-2.5 shadow-md">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5 text-[13px]">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.dataKey === 'temperature_max' ? '↑ High' : '↓ Low'}
          </span>
          <span className="ml-auto font-semibold tabular-nums text-foreground">
            {entry.value.toFixed(1)}°C
          </span>
        </div>
      ))}
    </div>
  );
}

export function WeatherChart({ daily }: { daily: WeatherPoint[] }) {
  const chartData = useMemo(
    () =>
      daily.map((day) => ({
        ...day,
        dateFormatted: formatDate(day.date),
      })),
    [daily],
  );

  // Compute chart summary metrics
  const metrics = useMemo(() => {
    if (!daily.length) return null;
    const highs = daily.map((d) => d.temperature_max);
    const lows = daily.map((d) => d.temperature_min);
    const highest = Math.max(...highs);
    const lowest = Math.min(...lows);
    return {
      highest,
      lowest,
      range: highest - lowest,
    };
  }, [daily]);

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-surface-raised">
      {/* Chart header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Temperature Trend</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Daily high and low temperatures
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[12px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-4 rounded-full bg-chart-high" />
            High
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-4 rounded-full bg-chart-low" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--chart-low)) 0px, hsl(var(--chart-low)) 4px, transparent 4px, transparent 7px)' }} />
            Low
          </span>
          <span className="text-muted-foreground/60">°C</span>
        </div>
      </div>

      {/* Chart summary metrics */}
      {metrics && (
        <div className="flex divide-x divide-border border-b border-border">
          <div className="flex-1 px-5 py-3">
            <p className="text-[11px] text-muted-foreground">Highest</p>
            <p className="mt-0.5 flex items-center gap-1 text-[15px] font-semibold tabular-nums text-chart-high">
              <ArrowUp size={13} strokeWidth={2} />
              {metrics.highest.toFixed(1)}°C
            </p>
          </div>
          <div className="flex-1 px-5 py-3">
            <p className="text-[11px] text-muted-foreground">Lowest</p>
            <p className="mt-0.5 flex items-center gap-1 text-[15px] font-semibold tabular-nums text-chart-low">
              <ArrowDown size={13} strokeWidth={2} />
              {metrics.lowest.toFixed(1)}°C
            </p>
          </div>
          <div className="flex-1 px-5 py-3">
            <p className="text-[11px] text-muted-foreground">Range</p>
            <p className="mt-0.5 flex items-center gap-1 text-[15px] font-semibold tabular-nums text-foreground">
              <TrendingUp size={13} strokeWidth={2} />
              {metrics.range.toFixed(1)}°C
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="px-2 pb-4 pt-4 sm:px-4">
        <div className="h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="dateFormatted"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => `${val}°`}
                width={36}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: 'hsl(var(--border-strong))', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line
                type="monotone"
                dataKey="temperature_max"
                stroke="hsl(var(--chart-high))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--chart-high))' }}
                animationDuration={800}
                animationEasing="ease-out"
              />
              <Line
                type="monotone"
                dataKey="temperature_min"
                stroke="hsl(var(--chart-low))"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--chart-low))' }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
