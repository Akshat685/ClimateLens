'use client';

import { CalendarDays, CloudDownload, Info, Loader2, MapPin } from 'lucide-react';

type WeatherFormProps = {
  latitude: string;
  longitude: string;
  startDate: string;
  endDate: string;
  loading: boolean;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSubmit: () => void;
};

export function WeatherForm({
  latitude,
  longitude,
  startDate,
  endDate,
  loading,
  onLatitudeChange,
  onLongitudeChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
}: WeatherFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="border-b border-border p-4">
      {/* Section header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <CloudDownload size={14} className="text-primary" strokeWidth={1.8} />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            New Snapshot
          </h3>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          Fetch historical weather data
        </p>
      </div>

      <div className="space-y-3.5">
        {/* Location */}
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <MapPin size={11} className="text-muted-foreground" strokeWidth={1.8} />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Location
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => onLatitudeChange(e.target.value)}
                aria-label="Latitude"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => onLongitudeChange(e.target.value)}
                aria-label="Longitude"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </label>
          </div>
        </div>

        {/* Date range */}
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <CalendarDays size={11} className="text-muted-foreground" strokeWidth={1.8} />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Date Range
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-0.5 block text-[11px] text-muted-foreground/60">From</span>
              <input
                type="date"
                value={startDate}
                max={today}
                onChange={(e) => onStartDateChange(e.target.value)}
                aria-label="Start date"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="mb-0.5 block text-[11px] text-muted-foreground/60">To</span>
              <input
                type="date"
                value={endDate}
                max={today}
                onChange={(e) => onEndDateChange(e.target.value)}
                aria-label="End date"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </label>
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground/50">
            <Info size={10} strokeWidth={1.5} />
            Historical data only · Maximum 31 days
          </p>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <CloudDownload size={15} strokeWidth={1.8} />
          )}
          {loading ? 'Fetching weather…' : 'Fetch & Store'}
        </button>
      </div>
    </div>
  );
}
