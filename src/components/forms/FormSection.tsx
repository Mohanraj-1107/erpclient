import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconClassName?: string;
  children: ReactNode;
}

export function FormSection({
  icon,
  title,
  description,
  iconClassName,
  children,
}: FormSectionProps) {
  return (
    <section className="rounded-xl border border-theme-border/80 bg-theme-surface-hover/80 shadow-xs">
      <div className="flex items-start gap-3 rounded-t-xl border-b border-theme-border/60 bg-theme-border/70 px-4 py-3.5 sm:px-5">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100',
            iconClassName
          )}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-theme-text">{title}</h3>
          <p className="mt-0.5 text-xs text-theme-text-muted">{description}</p>
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}
