'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-xl px-4 py-3 shadow-xl"
    >
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-3 text-[14px]">
            <span
              className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
              style={{ backgroundColor: entry.color, boxShadow: `0 0 12px ${entry.color}` }}
            />
            <span className="font-medium text-foreground">
              {entry.dataKey === 'temperature_max' ? 'High Temp' : 'Low Temp'}
            </span>
            <span className="ml-auto font-bold tabular-nums tracking-tight">
              {entry.value.toFixed(1)}°
            </span>
          </div>
        ))}
      </div>
    </motion.div>
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-panel overflow-hidden rounded-2xl"
    >
      {/* Chart header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 px-6 py-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Temperature Trend</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Historical highs and lows
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-[13px] font-medium">
          <span className="flex items-center gap-2 text-foreground">
            <span className="h-1.5 w-4 rounded-full bg-chart-high shadow-[0_0_8px_hsl(var(--chart-high))]" />
            High
          </span>
          <span className="flex items-center gap-2 text-foreground">
            <span className="h-1.5 w-4 rounded-full bg-chart-low shadow-[0_0_8px_hsl(var(--chart-low))]" />
            Low
          </span>
        </div>
      </div>

      {/* Chart summary metrics */}
      {metrics && (
        <div className="flex divide-x divide-border/50 border-b border-border/50 bg-surface/30">
          <div className="flex-1 px-6 py-4">
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">Highest</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[18px] font-bold tabular-nums tracking-tight text-chart-high drop-shadow-[0_0_8px_rgba(255,105,180,0.4)]">
              <ArrowUp size={16} strokeWidth={2.5} />
              {metrics.highest.toFixed(1)}°
            </p>
          </div>
          <div className="flex-1 px-6 py-4">
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">Lowest</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[18px] font-bold tabular-nums tracking-tight text-chart-low drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]">
              <ArrowDown size={16} strokeWidth={2.5} />
              {metrics.lowest.toFixed(1)}°
            </p>
          </div>
          <div className="flex-1 px-6 py-4">
            <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">Spread</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[18px] font-bold tabular-nums tracking-tight text-foreground">
              <TrendingUp size={16} strokeWidth={2.5} className="text-muted-foreground" />
              {metrics.range.toFixed(1)}°
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="px-2 pb-4 pt-6 sm:px-4">
        <div className="h-[300px] w-full sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-high))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-high))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-low))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-low))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="hsl(var(--chart-grid))"
                vertical={false}
              />
              <XAxis
                dataKey="dateFormatted"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => `${val}°`}
                width={40}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: 'hsl(var(--border-strong))', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="temperature_max"
                stroke="hsl(var(--chart-high))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorHigh)"
                activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--chart-high))', style: { filter: 'drop-shadow(0 0 8px hsl(var(--chart-high)))' } }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="temperature_min"
                stroke="hsl(var(--chart-low))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorLow)"
                activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--chart-low))', style: { filter: 'drop-shadow(0 0 8px hsl(var(--chart-low)))' } }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
