'use client';

import { Cloud, Moon, Sun, PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type HeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-border/40 bg-surface/60 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        {/* Left: sidebar toggle + logo */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-surface-raised hover:text-foreground hover:shadow-sm"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose size={18} strokeWidth={2.5} /> : <PanelLeft size={18} strokeWidth={2.5} />}
          </button>

          <div className="h-6 w-px bg-border/60" aria-hidden="true" />

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-default"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-glow-primary">
              <Cloud size={20} strokeWidth={2.5} className="relative z-10" />
              <Sparkles size={10} className="absolute right-1 top-1 opacity-70" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-extrabold tracking-tighter text-foreground leading-none">
                Climate<span className="text-primary">Lens</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mt-0.5">
                Explorer
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right: theme toggle */}
        <div className="flex items-center gap-2">
          {mounted && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-muted-foreground shadow-sm transition-all duration-200 hover:text-foreground hover:shadow-md border border-border/50"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
