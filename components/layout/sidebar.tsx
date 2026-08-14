'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Sidebar({ open, onClose, children }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 lg:flex lg:flex-col lg:border-r lg:border-border lg:bg-surface-raised transition-all duration-200 ease-out ${
          open ? 'lg:w-[var(--sidebar-width)]' : 'lg:w-0 lg:overflow-hidden lg:border-r-0'
        }`}
      >
        <div className="flex h-full w-[var(--sidebar-width)] flex-col overflow-hidden">
          {children}
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="animate-fade-in absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="animate-slide-in-left absolute inset-y-0 left-0 flex w-[min(320px,85vw)] flex-col border-r border-border bg-surface-raised shadow-xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
              <span className="text-[13px] font-semibold text-foreground">Data Explorer</span>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                aria-label="Close panel"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
