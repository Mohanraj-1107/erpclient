import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Minus, Plus, TriangleAlert, X } from 'lucide-react';
import type { InventoryItem, StockAdjustmentMode } from '@/types/inventory';
import { cn, formatQuantity } from '@/lib/utils';
import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StockAdjustDialogProps {
  open: boolean;
  item: InventoryItem | null;
  mode: StockAdjustmentMode;
  minimumStock?: number;
  loading?: boolean;
  serverError?: string;
  onClearError?: () => void;
  onCancel: () => void;
  onConfirm: (quantity: number) => void;
}

const PRESETS = [10, 25, 50, 100];

function StockStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-3.5 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-base font-normal text-slate-900">
        {value !== null ? (
          <>
            {formatQuantity(value)}{' '}
            <span className="text-xs font-normal text-slate-500">{unit}</span>
          </>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </p>
    </div>
  );
}

export function StockAdjustDialog({
  open,
  item,
  mode,
  minimumStock,
  loading = false,
  serverError,
  onClearError,
  onCancel,
  onConfirm,
}: StockAdjustDialogProps) {
  const inputId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);
  const loadingRef = useRef(loading);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);

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
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
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

  if (!open || !item) return null;

  const isAdd = mode === 'add';
  const unit = item.unit.toLowerCase();
  const numeric = Number(quantity);
  const isValid = quantity.trim() !== '' && Number.isFinite(numeric) && numeric > 0;
  const exceedsStock = !isAdd && isValid && numeric > item.quantity;
  const newQuantity =
    isValid && !exceedsStock
      ? isAdd
        ? item.quantity + numeric
        : item.quantity - numeric
      : null;
  const wouldBeLow =
    newQuantity !== null &&
    minimumStock !== undefined &&
    newQuantity <= minimumStock;

  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    setError(null);
    onClearError?.();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid) {
      setError('Enter a quantity greater than zero.');
      return;
    }

    if (exceedsStock) {
      setError(
        `Cannot remove more than the current stock (${formatQuantity(item.quantity)} ${unit}).`
      );
      return;
    }

    setError(null);
    onConfirm(numeric);
  };

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
        aria-labelledby="stock-dialog-title"
        aria-describedby="stock-dialog-description"
        className="animate-dialog-in relative w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-300/40"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 pr-12">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1',
                isAdd
                  ? 'bg-emerald-50 text-emerald-600 ring-emerald-100'
                  : 'bg-red-50 text-red-600 ring-red-100'
              )}
            >
              {isAdd ? (
                <Plus className="h-5 w-5" />
              ) : (
                <Minus className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <h3
                id="stock-dialog-title"
                className="text-base font-medium text-slate-900"
              >
                {isAdd ? 'Add stock' : 'Remove stock'}
              </h3>
              <p
                id="stock-dialog-description"
                className="mt-1 text-sm leading-relaxed text-slate-500"
              >
                {isAdd ? 'Increase' : 'Decrease'} the stock level for{' '}
                <span className="text-slate-700">{item.productName}</span>.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <StockStat label="Current stock" value={item.quantity} unit={unit} />
              <StockStat
                label="Minimum stock"
                value={minimumStock ?? null}
                unit={unit}
              />
            </div>

            <div>
              <label
                htmlFor={inputId}
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Quantity to {isAdd ? 'add' : 'remove'}
              </label>
              <div className="relative">
                <Input
                  id={inputId}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(event) => handleQuantityChange(event.target.value)}
                  placeholder="0"
                  autoFocus
                  disabled={loading}
                  className={cn(
                    'pr-16',
                    error && 'border-red-300 focus:ring-red-500'
                  )}
                  aria-invalid={Boolean(error)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-normal uppercase tracking-wider text-slate-400">
                  {item.unit}
                </span>
              </div>
              {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuantityChange(String(preset))}
                  disabled={loading}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-normal text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50"
                >
                  {isAdd ? '+' : '−'}
                  {preset}
                </button>
              ))}
            </div>

            {serverError && <Alert tone="error">{serverError}</Alert>}

            <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-normal text-slate-600">
                  New stock level
                </span>
                {newQuantity !== null ? (
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-base font-normal tabular-nums text-slate-900">
                      {formatQuantity(newQuantity)}
                    </span>
                    <span className="text-xs font-normal uppercase tracking-wider text-slate-400">
                      {item.unit}
                    </span>
                    {wouldBeLow && (
                      <Badge
                        variant="warning"
                        className="font-normal normal-case tracking-normal"
                      >
                        low
                      </Badge>
                    )}
                  </span>
                ) : (
                  <span className="text-sm text-slate-300">—</span>
                )}
              </div>
            </div>

            {wouldBeLow && (
              <p className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-normal leading-relaxed text-amber-700">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                This will leave the product at or below its minimum stock.
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200/70 bg-slate-50/60 px-5 py-3.5 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="font-normal"
            >
              Cancel
            </Button>
            <Button
              variant={isAdd ? 'primary' : 'destructive'}
              type="submit"
              disabled={loading}
              className="gap-2 font-normal"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isAdd ? 'Add stock' : 'Remove stock'}
            </Button>
          </div>
        </form>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute right-3 top-3 rounded-md border-0 p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-0 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
