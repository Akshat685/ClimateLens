'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Cloud, Copy, Check } from 'lucide-react';
import { PaginationControls } from './pagination-controls';
import type { WeatherPoint } from '@/lib/weather';

type WeatherTableProps = {
  daily: WeatherPoint[];
  fileName?: string;
};

function formatDate(value: string): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function WeatherTable({ daily, fileName }: WeatherTableProps) {
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);

  const pageCount = Math.max(1, Math.ceil(daily.length / Number(pageSize)));
  const paginated = useMemo(
    () => daily.slice((page - 1) * Number(pageSize), page * Number(pageSize)),
    [daily, page, pageSize],
  );

  const handleCopyFilename = async () => {
    if (!fileName) return;
    try {
      await navigator.clipboard.writeText(fileName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-surface-raised">
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Daily Records</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {daily.length} observation{daily.length !== 1 ? 's' : ''}
          </p>
        </div>
        {fileName && (
          <div className="flex items-center gap-1.5">
            <span className="hidden items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground/60 sm:inline-flex">
              <Cloud size={10} strokeWidth={1.5} />
              Source: S3
            </span>
            <button
              type="button"
              onClick={() => void handleCopyFilename()}
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-border px-2 text-[11px] text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              title={fileName}
              aria-label="Copy filename"
            >
              {copied ? (
                <>
                  <Check size={11} className="text-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={11} />
                  Copy key
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="sticky top-0 bg-surface px-5 py-3 font-medium">Date</th>
                <th className="sticky top-0 bg-surface px-5 py-3 font-medium">Max Temp</th>
                <th className="sticky top-0 bg-surface px-5 py-3 font-medium">Min Temp</th>
                <th className="sticky top-0 bg-surface px-5 py-3 font-medium">Feels Like Max</th>
                <th className="sticky top-0 bg-surface px-5 py-3 font-medium">Feels Like Min</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((day) => (
                <tr
                  key={day.date}
                  className="border-t border-border/60 transition-colors duration-100 hover:bg-muted/30"
                >
                  <td className="px-5 py-3 font-medium text-foreground">
                    {formatDate(day.date)}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-chart-high/8 px-2 py-0.5 text-[12px] font-semibold tabular-nums text-chart-high">
                      <ArrowUp size={10} strokeWidth={2.5} />
                      {day.temperature_max.toFixed(1)}°C
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-chart-low/8 px-2 py-0.5 text-[12px] font-semibold tabular-nums text-chart-low">
                      <ArrowDown size={10} strokeWidth={2.5} />
                      {day.temperature_min.toFixed(1)}°C
                    </span>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">
                    {day.apparent_temperature_max.toFixed(1)}°C
                  </td>
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">
                    {day.apparent_temperature_min.toFixed(1)}°C
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-px md:hidden">
        {paginated.map((day) => (
          <div
            key={day.date}
            className="border-t border-border/60 px-4 py-3.5"
          >
            <p className="text-[13px] font-medium text-foreground">{formatDate(day.date)}</p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              <div>
                <p className="text-[11px] text-muted-foreground">Max</p>
                <p className="mt-0.5 font-semibold tabular-nums text-chart-high">
                  {day.temperature_max.toFixed(1)}°C
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Min</p>
                <p className="mt-0.5 font-semibold tabular-nums text-chart-low">
                  {day.temperature_min.toFixed(1)}°C
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Feels max</p>
                <p className="mt-0.5 tabular-nums text-muted-foreground">
                  {day.apparent_temperature_max.toFixed(1)}°C
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Feels min</p>
                <p className="mt-0.5 tabular-nums text-muted-foreground">
                  {day.apparent_temperature_min.toFixed(1)}°C
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="border-t border-border px-5 py-3">
        <PaginationControls
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          total={daily.length}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          sizeLabel="rows"
        />
      </div>
    </div>
  );
}
