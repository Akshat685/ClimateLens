'use client';

import { Cloud, Moon, Sun, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type HeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-border bg-surface-raised/80 backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-4 lg:px-5">
        {/* Left: sidebar toggle + logo */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>

          <div className="h-5 w-px bg-border" aria-hidden="true" />

          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Cloud size={14} strokeWidth={2} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Climate<span className="text-primary">Lens</span>
              </span>
              <span className="hidden text-[11px] text-muted-foreground sm:inline">
                Climate Analytics
              </span>
            </div>
          </div>
        </div>

        {/* Right: status badges + theme toggle */}
        <div className="flex items-center gap-1.5">
          <span
            className="hidden items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground sm:inline-flex"
            title="Connected to AWS S3 storage"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-label="Connected" />
            S3 Connected
          </span>
          <span
            className="hidden items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground md:inline-flex"
            title="Historical weather data from Open-Meteo API"
          >
            <Cloud size={11} strokeWidth={1.8} />
            Open-Meteo
          </span>

          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
