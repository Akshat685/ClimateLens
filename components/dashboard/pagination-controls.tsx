'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  page: number;
  pageCount: number;
  pageSize: string;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: string) => void;
  sizeLabel?: string;
};

export function PaginationControls({
  page,
  pageCount,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  sizeLabel = 'per page',
}: Props) {
  const size = Number(pageSize);
  const start = total ? (page - 1) * size + 1 : 0;
  const end = total ? Math.min(page * size, total) : 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[12px] tabular-nums text-muted-foreground">
        {total ? `${start}–${end} of ${total}` : 'No items'}
      </p>
      <div className="flex items-center gap-1.5">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(e.target.value)}
          className="rounded-lg border border-input bg-surface-raised px-2 py-1.5 text-[12px] text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-1 focus:ring-primary/20"
          aria-label="Items per page"
        >
          <option value="10">10 {sizeLabel}</option>
          <option value="20">20 {sizeLabel}</option>
          <option value="50">50 {sizeLabel}</option>
        </select>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-input bg-surface-raised text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="min-w-[3rem] text-center text-[12px] tabular-nums text-muted-foreground">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-input bg-surface-raised text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
