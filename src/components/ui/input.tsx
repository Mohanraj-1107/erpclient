import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-theme-input-border bg-theme-surface px-3 py-2 text-sm text-theme-text placeholder-theme-placeholder transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-theme-primary-ring disabled:bg-theme-page',
        className
      )}
      {...props}
    />
  );
}
