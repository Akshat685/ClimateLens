'use client';

import { CalendarDays, CloudDownload, Info, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="border-b border-border/40 p-5">
      {/* Section header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <CloudDownload size={16} className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" strokeWidth={2} />
          <h3 className="text-[13px] font-bold uppercase tracking-widest text-foreground">
            New Snapshot
          </h3>
        </div>
        <p className="mt-1.5 text-[12px] text-muted-foreground/80">
          Fetch historical weather data from Open-Meteo
        </p>
      </div>

      <div className="space-y-4">
        {/* Location */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <MapPin size={12} className="text-muted-foreground" strokeWidth={2} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Location
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative group">
              <input
                type="text"
                inputMode="decimal"
                id="latitude"
                placeholder=" "
                value={latitude}
                onChange={(e) => onLatitudeChange(e.target.value)}
                className="peer w-full rounded-xl border border-input/60 bg-surface/50 px-3 pb-2 pt-6 text-[13px] font-medium text-foreground outline-none transition-all duration-200 focus:border-primary focus:bg-surface focus:shadow-glow-primary focus:ring-1 focus:ring-primary/50"
              />
              <label 
                htmlFor="latitude"
                className="pointer-events-none absolute left-3 top-4 -translate-y-1/2 text-[11px] font-medium text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[13px] peer-focus:top-4 peer-focus:text-[11px] peer-focus:text-primary"
              >
                Lat (-90 to 90)
              </label>
            </div>
            <div className="relative group">
              <input
                type="text"
                inputMode="decimal"
                id="longitude"
                placeholder=" "
                value={longitude}
                onChange={(e) => onLongitudeChange(e.target.value)}
                className="peer w-full rounded-xl border border-input/60 bg-surface/50 px-3 pb-2 pt-6 text-[13px] font-medium text-foreground outline-none transition-all duration-200 focus:border-primary focus:bg-surface focus:shadow-glow-primary focus:ring-1 focus:ring-primary/50"
              />
              <label 
                htmlFor="longitude"
                className="pointer-events-none absolute left-3 top-4 -translate-y-1/2 text-[11px] font-medium text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[13px] peer-focus:top-4 peer-focus:text-[11px] peer-focus:text-primary"
              >
                Lon (-180 to 180)
              </label>
            </div>
          </div>
        </div>

        {/* Date range */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <CalendarDays size={12} className="text-muted-foreground" strokeWidth={2} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Date Range
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative group">
              <input
                type="date"
                id="start_date"
                value={startDate}
                max={today}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="peer w-full rounded-xl border border-input/60 bg-surface/50 px-3 pb-2 pt-6 text-[13px] font-medium text-foreground outline-none transition-all duration-200 focus:border-primary focus:bg-surface focus:shadow-glow-primary focus:ring-1 focus:ring-primary/50"
              />
              <label 
                htmlFor="start_date"
                className="pointer-events-none absolute left-3 top-4 -translate-y-1/2 text-[11px] font-medium text-muted-foreground transition-all"
              >
                From
              </label>
            </div>
            <div className="relative group">
              <input
                type="date"
                id="end_date"
                value={endDate}
                max={today}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="peer w-full rounded-xl border border-input/60 bg-surface/50 px-3 pb-2 pt-6 text-[13px] font-medium text-foreground outline-none transition-all duration-200 focus:border-primary focus:bg-surface focus:shadow-glow-primary focus:ring-1 focus:ring-primary/50"
              />
              <label 
                htmlFor="end_date"
                className="pointer-events-none absolute left-3 top-4 -translate-y-1/2 text-[11px] font-medium text-muted-foreground transition-all"
              >
                To
              </label>
            </div>
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/70">
            <Info size={12} strokeWidth={2} className="text-primary/70" />
            Historical data only · Max 31 days
          </p>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="relative mt-2 flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 px-4 text-[13px] font-bold text-primary-foreground shadow-[0_4px_14px_0_hsl(var(--primary)/30%)] transition-all disabled:pointer-events-none disabled:opacity-50"
        >
          {/* Animated background gradient sweep */}
          <span className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.2),transparent)] translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
            />
          ) : (
            <CloudDownload size={16} strokeWidth={2.5} />
          )}
          {loading ? 'Fetching...' : 'Fetch & Store'}
        </motion.button>
      </div>
    </div>
  );
}
