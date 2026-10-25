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
          ? 'border-red-100 bg-red-50 text-red-700'
          : 'border-emerald-100 bg-emerald-50 text-emerald-700',
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
