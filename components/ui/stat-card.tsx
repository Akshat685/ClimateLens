'use client';

import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: string;
  secondaryValue?: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, secondaryValue, icon: Icon }: StatCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-surface-raised p-5 transition-colors duration-150 hover:border-border-strong">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
        <Icon size={16} strokeWidth={1.8} />
      </div>
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{value}</p>
      {secondaryValue && (
        <p className="mt-0.5 text-xs text-muted-foreground">{secondaryValue}</p>
      )}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5">
      <div className="mb-3 h-8 w-8 animate-skeleton rounded-lg bg-muted" />
      <div className="h-3 w-14 animate-skeleton rounded bg-muted" />
      <div className="mt-2 h-5 w-24 animate-skeleton rounded bg-muted" />
      <div className="mt-1.5 h-3 w-20 animate-skeleton rounded bg-muted" />
    </div>
  );
}
