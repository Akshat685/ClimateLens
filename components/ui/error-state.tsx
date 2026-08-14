'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center sm:py-12">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
        <AlertCircle size={20} className="text-destructive" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 text-[14px] font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors duration-150 hover:bg-muted"
        >
          <RefreshCw size={12} strokeWidth={1.8} />
          Try Again
        </button>
      )}
    </div>
  );
}
