'use client';

import { BarChart3, CalendarDays, MapPin, Thermometer } from 'lucide-react';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import type { WeatherPayload } from '@/lib/weather';

type WeatherSummaryProps = {
  payload: WeatherPayload | null;
  fileName: string | null;
  loading: boolean;
};

function formatShortDate(value: string): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function formatYear(value: string): string {
  if (!value) return '';
  return new Date(value).getFullYear().toString();
}

export function WeatherSummary({ payload, fileName, loading }: WeatherSummaryProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!payload) return null;

  const avgMax =
    payload.daily.reduce((sum, d) => sum + d.temperature_max, 0) / payload.daily.length;
  const avgMin =
    payload.daily.reduce((sum, d) => sum + d.temperature_min, 0) / payload.daily.length;

  return (
    <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Location"
        value={`${payload.latitude.toFixed(2)}°, ${payload.longitude.toFixed(2)}°`}
        secondaryValue="Selected coordinates"
        icon={MapPin}
      />
      <StatCard
        label="Date Range"
        value={`${formatShortDate(payload.start_date)} – ${formatShortDate(payload.end_date)}`}
        secondaryValue={formatYear(payload.start_date)}
        icon={CalendarDays}
      />
      <StatCard
        label="Records"
        value={`${payload.daily.length}`}
        secondaryValue="Daily observations"
        icon={BarChart3}
      />
      <StatCard
        label="Avg Temperature"
        value={`${avgMax.toFixed(1)}°C`}
        secondaryValue={`Avg high · ${avgMin.toFixed(1)}°C avg low`}
        icon={Thermometer}
      />
    </div>
  );
}
