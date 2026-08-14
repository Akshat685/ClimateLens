'use client';

import { useMemo, useState } from 'react';
import {
  Database,
  FileJson,
  RefreshCw,
  Search,
  Copy,
  Check,
} from 'lucide-react';
import type { StoredFile } from '@/lib/storage';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';

type FileBrowserProps = {
  files: StoredFile[];
  selectedFile: StoredFile | null;
  loading: boolean;
  error: string;
  onSelectFile: (file: StoredFile) => void;
  onRefresh: () => void;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/** Parse S3 filename like weather_41.52_-65.89_2026-08-01_2026-08-11_20260812T064631Z.json */
function parseFileName(name: string): { dateRange: string; coords: string; raw: string } {
  const raw = name;
  try {
    // Remove extension and prefix
    const base = name.replace(/\.json$/i, '');
    const parts = base.split('_');

    // Try to find lat/lon and dates
    // Expected: weather_LAT_LON_STARTDATE_ENDDATE_TIMESTAMP
    if (parts.length >= 5) {
      const lat = parseFloat(parts[1]);
      const lon = parseFloat(parts[2]);
      const startDate = parts[3];
      const endDate = parts[4];

      if (!isNaN(lat) && !isNaN(lon) && startDate.includes('-') && endDate.includes('-')) {
        const fmt = (d: string) => {
          try {
            return new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
            }).format(new Date(d + 'T00:00:00'));
          } catch {
            return d;
          }
        };

        const year = new Date(startDate + 'T00:00:00').getFullYear();
        const dateRange = `${fmt(startDate)} – ${fmt(endDate)}, ${year}`;
        const coords = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;

        return { dateRange, coords, raw };
      }
    }
  } catch {
    // Fall through to raw display
  }

  return { dateRange: '', coords: '', raw };
}

function formatCreatedDate(value: string): string {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

export function FileBrowser({
  files,
  selectedFile,
  loading,
  error,
  onSelectFile,
  onRefresh,
}: FileBrowserProps) {
  const [query, setQuery] = useState('');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const filteredFiles = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
    [files, query],
  );

  const handleCopy = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(name);
      setCopiedFile(name);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Stored Snapshots
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
            {files.length} dataset{files.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground disabled:opacity-50"
          aria-label="Refresh datasets"
          title="Refresh datasets from S3"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-border px-4 py-2.5">
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50"
          />
          <input
            type="search"
            placeholder="Search datasets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-1.5 pl-8 pr-3 text-[13px] text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-lg p-3">
                <div className="h-3.5 w-3/4 animate-skeleton rounded bg-muted" />
                <div className="mt-1.5 h-3 w-1/2 animate-skeleton rounded bg-muted" />
                <div className="mt-1.5 flex gap-3">
                  <div className="h-2.5 w-10 animate-skeleton rounded bg-muted" />
                  <div className="h-2.5 w-12 animate-skeleton rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorState
              title="Unable to load datasets"
              message="Could not retrieve snapshots from S3. Check your connection and try again."
              onRetry={onRefresh}
            />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-4">
            {files.length === 0 ? (
              <EmptyState
                icon={Database}
                title="No snapshots yet"
                description="Create your first weather snapshot using the form above."
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No matches"
                description={`No datasets matching "${query}".`}
              />
            )}
          </div>
        ) : (
          <ul className="space-y-0.5 p-2" role="listbox" aria-label="Stored weather datasets">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile?.name === file.name;
              const parsed = parseFileName(file.name);

              return (
                <li key={file.name} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => onSelectFile(file)}
                    className={`group flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
                      isSelected
                        ? 'border border-primary/20 bg-primary/8 text-foreground'
                        : 'border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <FileJson
                      size={15}
                      className={`mt-0.5 shrink-0 ${isSelected ? 'text-primary' : ''}`}
                      strokeWidth={1.8}
                    />
                    <div className="min-w-0 flex-1">
                      {parsed.dateRange ? (
                        <>
                          <p className="text-[13px] font-medium leading-snug">{parsed.dateRange}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{parsed.coords}</p>
                        </>
                      ) : (
                        <p className="truncate font-mono text-xs">{file.name}</p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground/60">
                        <span>{formatBytes(file.size)}</span>
                        {file.created_at && (
                          <>
                            <span>·</span>
                            <span>{formatCreatedDate(file.created_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => void handleCopy(file.name, e)}
                      className="mt-0.5 hidden h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-foreground group-hover:inline-flex"
                      aria-label="Copy filename"
                      title={file.name}
                    >
                      {copiedFile === file.name ? (
                        <Check size={12} className="text-success" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
