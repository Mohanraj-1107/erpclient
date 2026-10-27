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
    <section className="rounded-xl border border-slate-200/80 bg-slate-100/80 shadow-xs">
      <div className="flex items-start gap-3 rounded-t-xl border-b border-slate-200/60 bg-slate-200/70 px-4 py-3.5 sm:px-5">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100',
            iconClassName
          )}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}
