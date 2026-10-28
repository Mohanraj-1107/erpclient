import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ToastContext,
  type ToastContextValue,
  type ToastOptions,
  type ToastVariant,
} from './useToast';

interface ToastRecord {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

const variantStyles: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; card: string; tile: string; bar: string }
> = {
  success: {
    icon: CheckCircle2,
    card: 'border-theme-toast-success-border bg-theme-toast-success text-theme-toast-success-fg',
    tile: 'bg-status-success text-status-success-fg ring-status-success-border',
    bar: 'bg-status-success-fg',
  },
  error: {
    icon: AlertTriangle,
    card: 'border-theme-toast-error-border bg-theme-toast-error text-theme-toast-error-fg',
    tile: 'bg-status-error text-status-error-fg ring-status-error-border',
    bar: 'bg-status-error-fg',
  },
  info: {
    icon: Info,
    card: 'border-theme-toast-info-border bg-theme-toast-info text-theme-toast-info-fg',
    tile: 'bg-status-info text-status-info-fg ring-status-info-border',
    bar: 'bg-status-info-fg',
  },
};

let nextToastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'info', duration = 4200 }: ToastOptions) => {
      const id = ++nextToastId;
      setToasts((prev) => [
        ...prev,
        { id, title, description, variant, duration },
      ]);

      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) =>
        toast({ title, description, variant: 'success' }),
      error: (title, description) =>
        toast({ title, description, variant: 'error', duration: 5600 }),
      info: (title, description) =>
        toast({ title, description, variant: 'info' }),
    }),
    [toast]
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      >
        {toasts.map((item) => {
          const style = variantStyles[item.variant];
          const Icon = style.icon;
          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                'animate-toast-in pointer-events-auto relative w-full overflow-hidden rounded-xl border p-3.5 pr-9 shadow-lg shadow-slate-300/40',
                style.card
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
                    style.tile
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description && (
                    <p className="mt-0.5 text-xs leading-relaxed opacity-80">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className="absolute right-2 top-2 rounded-md p-1 text-theme-text-subtle transition-colors hover:bg-theme-surface-hover hover:text-theme-text-muted border-0 focus:outline-none focus:ring-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {item.duration > 0 && (
                <div
                  className={cn(
                    'animate-toast-progress absolute bottom-0 left-0 h-0.5',
                    style.bar
                  )}
                  style={{ animationDuration: `${item.duration}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
