import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);
  const loadingRef = useRef(loading);

  useEffect(() => {
    onCancelRef.current = onCancel;
    loadingRef.current = loading;
  });

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loadingRef.current) {
        onCancelRef.current();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
    >
      <div
        className="animate-overlay-in absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="animate-dialog-in relative w-full max-w-sm overflow-hidden rounded-xl border border-theme-border bg-theme-surface shadow-xl shadow-slate-300/40"
      >
        <div className="p-4 pr-10">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-status-error text-status-error-fg ring-1 ring-status-error-border">
              {icon ?? <AlertTriangle className="h-4 w-4" />}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <h3
                id="confirm-dialog-title"
                className="text-sm font-semibold text-slate-900"
              >
                {title}
              </h3>
              <p
                id="confirm-dialog-description"
                className="mt-1 text-xs leading-relaxed text-slate-500"
              >
                {message}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute right-2 top-2 rounded-md border-0 p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-0 disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex flex-col-reverse gap-2 border-t border-theme-border/70 bg-theme-page/60 px-4 py-3 sm:flex-row sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            autoFocus
          >
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="gap-1.5"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
