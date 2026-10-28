import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-theme-primary text-theme-primary-fg hover:bg-theme-primary-hover focus:ring-theme-primary-ring shadow-xs',
  secondary:
    'bg-theme-secondary text-theme-secondary-fg outline outline-1 -outline-offset-1 outline-theme-secondary-border hover:bg-theme-secondary-hover focus:ring-theme-muted-ring',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300 shadow-2xs',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-xs',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
