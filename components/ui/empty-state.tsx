'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-16 text-center sm:py-20">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon size={22} className="text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="mt-5 text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
