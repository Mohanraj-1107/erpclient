import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertProps {
  tone?: 'error' | 'success';
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = 'error', children, className }: AlertProps) {
  const isError = tone === 'error';
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-lg border p-3 text-sm',
        isError
          ? 'border-status-error-border bg-status-error text-status-error-fg'
          : 'border-status-success-border bg-status-success text-status-success-fg',
        className
      )}
    >
      {isError ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
