'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Background glowing orb for the hero card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-[hsl(var(--chart-low))] to-[hsl(var(--chart-high))] rounded-[2rem] blur-xl opacity-20 dark:opacity-30 animate-pulse" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="relative flex flex-col items-center rounded-[2rem] glass-panel px-8 py-20 text-center sm:px-12 sm:py-24 overflow-hidden"
      >
        {/* Subtle decorative background ring */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full border-[1px] border-primary/10 bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full border-[1px] border-[hsl(var(--chart-high))]/10 bg-[hsl(var(--chart-high))]/5 blur-3xl pointer-events-none" />

        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--chart-low))]/20 shadow-inner ring-1 ring-white/10 dark:ring-white/5 mb-8">
          <Icon size={36} className="text-primary drop-shadow-[0_0_12px_rgba(var(--primary),0.5)]" strokeWidth={2} />
        </div>
        
        <h3 className="text-[28px] font-black tracking-tight text-foreground sm:text-[32px] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          {title}
        </h3>
        
        <p className="mx-auto mt-4 max-w-md text-[15px] font-medium leading-relaxed text-muted-foreground/90">
          {description}
        </p>
        
        {action && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-10"
          >
            {action}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
