import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-status-error-fg">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-status-error-fg">{error}</p>
      ) : hint ? (
        <p className="text-xs text-theme-text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}
