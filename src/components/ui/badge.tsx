import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  success:
    'bg-status-success text-status-success-fg border-status-success-border',
  warning:
    'bg-status-warning text-status-warning-fg border-status-warning-border',
  danger: 'bg-status-error text-status-error-fg border-status-error-border',
  info: 'bg-status-info text-status-info-fg border-status-info-border',
};

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
