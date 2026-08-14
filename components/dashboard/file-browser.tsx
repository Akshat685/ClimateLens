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
import { motion, AnimatePresence } from 'framer-motion';
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

function parseFileName(name: string): { dateRange: string; coords: string; raw: string } {
  const raw = name;
  try {
    const base = name.replace(/\.json$/i, '');
    const parts = base.split('_');

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
  } catch { }

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
    } catch { }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-raised/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
        <div>
          <h3 className="text-[13px] font-bold uppercase tracking-widest text-foreground">
            Stored Snapshots
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground/80">
            {files.length} dataset{files.length !== 1 ? 's' : ''}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-surface text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Search */}
      <div className="border-b border-border/40 px-5 py-3">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Search datasets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-input/60 bg-surface/50 py-2 pl-9 pr-3 text-[13px] font-medium text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/50 focus:border-primary focus:bg-surface focus:shadow-glow-primary focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-xl border border-border/30 bg-surface/30 p-3.5">
                  <div className="h-4 w-3/4 animate-skeleton rounded-md bg-muted" />
                  <div className="mt-2 h-3 w-1/2 animate-skeleton rounded-md bg-muted" />
                  <div className="mt-3 flex gap-3">
                    <div className="h-2.5 w-10 animate-skeleton rounded-sm bg-muted" />
                    <div className="h-2.5 w-12 animate-skeleton rounded-sm bg-muted" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorState
                title="Unable to load datasets"
                message="Could not retrieve snapshots from S3. Check your connection."
                onRetry={onRefresh}
              />
            </motion.div>
          ) : filteredFiles.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
            </motion.div>
          ) : (
            <motion.ul 
              key="list"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-1.5"
            >
              {filteredFiles.map((file) => {
                const isSelected = selectedFile?.name === file.name;
                const parsed = parseFileName(file.name);

                return (
                  <motion.li key={file.name} variants={itemVariants}>
                    <button
                      type="button"
                      onClick={() => onSelectFile(file)}
                      className={`group relative flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-primary/50 bg-primary/10 shadow-glow-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:bg-surface hover:text-foreground hover:shadow-sm'
                      }`}
                    >
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${isSelected ? 'bg-primary text-primary-foreground shadow-glow-primary' : 'bg-surface-raised text-muted-foreground'}`}>
                        <FileJson size={14} strokeWidth={2.5} />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        {parsed.dateRange ? (
                          <>
                            <p className={`text-[13px] font-bold leading-snug tracking-tight ${isSelected ? 'text-primary' : ''}`}>
                              {parsed.dateRange}
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground/80">
                              {parsed.coords}
                            </p>
                          </>
                        ) : (
                          <p className={`truncate font-mono text-[11px] font-semibold ${isSelected ? 'text-primary' : ''}`}>
                            {file.name}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                          <span className="bg-surface px-1.5 py-0.5 rounded-md border border-border/50">{formatBytes(file.size)}</span>
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
                        className="absolute right-3 top-3.5 hidden h-6 w-6 items-center justify-center rounded-md bg-surface text-muted-foreground/50 transition-colors hover:text-foreground hover:shadow-sm group-hover:flex"
                        title="Copy Key"
                      >
                        {copiedFile === file.name ? (
                          <Check size={12} className="text-success" strokeWidth={2.5} />
                        ) : (
                          <Copy size={12} strokeWidth={2.5} />
                        )}
                      </button>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
