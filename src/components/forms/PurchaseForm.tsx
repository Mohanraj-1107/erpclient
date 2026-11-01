import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { IndianRupee, ListPlus, Mail, Phone, Plus, Save, ShoppingCart, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type {
  CreatePurchaseRequest,
  Purchase,
  PurchaseItem,
} from '@/types/purchase';
import { getLineTotals, getPurchaseTotals } from '@/types/purchase';
import { cn, formatMoney, formatQuantity } from '@/lib/utils';
import { supplierApi } from '@/api/suppliers';
import { productApi } from '@/api/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/ui/spinner';
import { FormSection } from '@/components/forms/FormSection';

interface PurchaseFormProps {
  initial?: Purchase;
  submitting?: boolean;
  submitLabel: string;
  serverError?: string;
  onSubmit: (payload: CreatePurchaseRequest) => void;
  onCancel: () => void;
}

interface ItemFormState {
  productId: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  discountRate: string;
}

type FormErrors = Record<string, string>;

/**
 * Column template for the line-item grid. Below `xl` each line falls back to a
 * stacked block, so the row never needs a horizontal scroll container (which
 * would clip the product dropdown).
 */
const LINE_GRID =
  'grid gap-3 xl:grid-cols-[1.75rem_minmax(11rem,1fr)_6rem_7.5rem_5rem_5rem_7rem_2.25rem] xl:items-start';

const EMPTY_ITEM: ItemFormState = {
  productId: '',
  quantity: '',
  unitPrice: '',
  taxRate: '',
  discountRate: '',
};

function toFormState(purchase?: Purchase): ItemFormState[] {
  const items = purchase?.items;
  if (!items || items.length === 0) return [{ ...EMPTY_ITEM }];
  return items.map((item) => ({
    productId: String(item.productId),
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
    taxRate: String(item.taxRate),
    discountRate: String(item.discountRate),
  }));
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function previewLineTotal(item: ItemFormState): number | null {
  const quantity = parseNumber(item.quantity);
  const unitPrice = parseNumber(item.unitPrice);
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return null;

  return getLineTotals({
    productId: 0,
    quantity,
    unitPrice,
    taxRate: parseNumber(item.taxRate) || 0,
    discountRate: parseNumber(item.discountRate) || 0,
  }).total;
}

function validate(supplierId: string, items: ItemFormState[]): FormErrors {
  const errors: FormErrors = {};

  if (!supplierId) {
    errors.supplierId = 'Select a supplier';
  }

  items.forEach((item, index) => {
    const prefix = `items.${index}`;

    if (!item.productId) {
      errors[`${prefix}.productId`] = 'Select a product';
    } else if (
      items.some(
        (other, otherIndex) =>
          otherIndex < index && other.productId === item.productId
      )
    ) {
      errors[`${prefix}.productId`] = 'This product is already on the order';
    }

    const quantity = parseNumber(item.quantity);
    if (!item.quantity.trim()) {
      errors[`${prefix}.quantity`] = 'Quantity is required';
    } else if (!Number.isInteger(quantity) || quantity <= 0) {
      errors[`${prefix}.quantity`] = 'Must be a whole number above 0';
    }

    const unitPrice = parseNumber(item.unitPrice);
    if (!item.unitPrice.trim()) {
      errors[`${prefix}.unitPrice`] = 'Unit price is required';
    } else if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      errors[`${prefix}.unitPrice`] = 'Enter a valid price';
    }

    const taxRate = parseNumber(item.taxRate);
    if (
      item.taxRate.trim() &&
      (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100)
    ) {
      errors[`${prefix}.taxRate`] = 'Must be 0–100';
    }

    const discountRate = parseNumber(item.discountRate);
    if (
      item.discountRate.trim() &&
      (!Number.isFinite(discountRate) ||
        discountRate < 0 ||
        discountRate > 100)
    ) {
      errors[`${prefix}.discountRate`] = 'Must be 0–100';
    }
  });

  return errors;
}

function computeTotals(items: ItemFormState[]) {
  const previewItems: PurchaseItem[] = [];

  items.forEach((item) => {
    const productId = Number(item.productId);
    const quantity = parseNumber(item.quantity);
    const unitPrice = parseNumber(item.unitPrice);
    const taxRate = parseNumber(item.taxRate) || 0;
    const discountRate = parseNumber(item.discountRate) || 0;

    if (
      Number.isInteger(productId) &&
      Number.isFinite(quantity) &&
      Number.isFinite(unitPrice)
    ) {
      previewItems.push({ productId, quantity, unitPrice, taxRate, discountRate });
    }
  });

  return getPurchaseTotals(previewItems);
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-status-error-fg">{message}</p>;
}

function LineField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="mb-1 block text-xs font-medium text-slate-700 xl:hidden">
        {label}
      </span>
      {children}
    </div>
  );
}

function TotalLine({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 text-xs',
        emphasize && 'border-t border-slate-200 pt-2.5'
      )}
    >
      <span className={emphasize ? 'font-semibold text-slate-700' : 'text-slate-400'}>
        {label}
      </span>
      <span
        className={cn(
          'text-right tabular-nums',
          emphasize
            ? 'text-sm font-semibold text-slate-900'
            : 'font-medium text-slate-700'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function PurchaseForm({
  initial,
  submitting,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: PurchaseFormProps) {
  const suppliersQuery = useQuery({
    queryKey: ['suppliers', 'all'],
    queryFn: supplierApi.listAll,
    staleTime: 60_000,
  });

  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: productApi.listAll,
    staleTime: 60_000,
  });

  const suppliers = useMemo(() => suppliersQuery.data ?? [], [suppliersQuery.data]);
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const supplierOptions = useMemo(
    () =>
      suppliers.map((supplier) => ({
        value: String(supplier.supplierId),
        label: supplier.supplierName,
      })),
    [suppliers]
  );

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: String(product.productId),
        label: `${product.productName} (${product.productCode})`,
      })),
    [products]
  );

  const [supplierId, setSupplierId] = useState(() =>
    initial?.supplierId ? String(initial.supplierId) : ''
  );
  const [items, setItems] = useState<ItemFormState[]>(() =>
    toFormState(initial)
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const totals = useMemo(() => computeTotals(items), [items]);
  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => String(supplier.supplierId) === supplierId),
    [suppliers, supplierId]
  );
  const totalUnits = items.reduce(
    (sum, item) => sum + (parseNumber(item.quantity) || 0),
    0
  );

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const setItemField = <K extends keyof ItemFormState>(
    index: number,
    field: K,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
    clearError(`items.${index}.${field}`);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(
      (candidate) => String(candidate.productId) === productId
    );

    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          productId,
          // Prefill from the catalogue when the fields are untouched.
          unitPrice:
            item.unitPrice.trim() === ''
              ? product
                ? String(product.purchasePrice)
                : item.unitPrice
              : item.unitPrice,
          taxRate:
            item.taxRate.trim() === ''
              ? product
                ? String(product.taxRate)
                : item.taxRate
              : item.taxRate,
        };
      })
    );
    clearError(`items.${index}.productId`);
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    setErrors((prev) => {
      const next: FormErrors = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (!key.startsWith('items.')) next[key] = value;
      });
      return next;
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate(supplierId, items);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      supplierId: Number(supplierId),
      items: items.map((item) => ({
        productId: Number(item.productId),
        quantity: parseNumber(item.quantity),
        unitPrice: parseNumber(item.unitPrice),
        taxRate: item.taxRate.trim() ? parseNumber(item.taxRate) : 0,
        discountRate: item.discountRate.trim()
          ? parseNumber(item.discountRate)
          : 0,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <FormSection
        icon={<ShoppingCart className="h-4 w-4" />}
        title="Purchase from"
        description="Supplier this order is being placed with."
        iconClassName="bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Supplier"
            htmlFor="supplierId"
            required
            error={errors.supplierId}
            hint={
              suppliers.length === 0
                ? 'No suppliers yet — create one under Suppliers first'
                : undefined
            }
          >
            <Select
              id="supplierId"
              value={supplierId}
              onChange={(value) => {
                setSupplierId(value);
                clearError('supplierId');
              }}
              options={supplierOptions}
              disabled={submitting || suppliersQuery.isLoading}
              placeholder={
                suppliersQuery.isLoading
                  ? 'Loading suppliers...'
                  : 'Select a supplier'
              }
              aria-invalid={Boolean(errors.supplierId)}
            />
          </FormField>

          <div className="rounded-lg border border-theme-border bg-theme-surface-muted px-3.5 py-3">
            {selectedSupplier ? (
              <>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {selectedSupplier.supplierName}
                </p>
                <div className="mt-1.5 space-y-1 text-xs text-slate-600">
                  {selectedSupplier.supplierEmail && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-theme-text-muted" />
                      <span className="truncate">
                        {selectedSupplier.supplierEmail}
                      </span>
                    </p>
                  )}
                  {selectedSupplier.mobileNo && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-theme-text-muted" />
                      {selectedSupplier.mobileNo}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">
                Supplier contact details appear here once selected.
              </p>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection
        icon={<ListPlus className="h-4 w-4" />}
        title="Line items"
        description="Products, quantities, pricing, tax, and discount."
        iconClassName="bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border"
      >
        <div className="rounded-lg border border-slate-200/80 bg-white">
          <div
            className={cn(
              LINE_GRID,
              'hidden rounded-t-lg border-b border-slate-200/80 bg-slate-50/70 px-4 py-2.5 xl:grid'
            )}
          >
            <span className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              #
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Product
            </span>
            <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Qty
            </span>
            <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Unit price
            </span>
            <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Tax %
            </span>
            <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Disc %
            </span>
            <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Line total
            </span>
            <span />
          </div>

          <div className="space-y-3 p-3 xl:space-y-0 xl:p-0">
            {items.map((item, index) => {
              const product = products.find(
                (candidate) => String(candidate.productId) === item.productId
              );
              const lineTotal = previewLineTotal(item);

              return (
                <div
                  key={index}
                  className={cn(
                    LINE_GRID,
                    'rounded-lg border border-slate-200/80 p-3.5',
                    'xl:rounded-none xl:border-0 xl:border-b xl:border-slate-100 xl:px-4 xl:py-3'
                  )}
                >
                  <span className="text-xs font-medium text-slate-400 tabular-nums xl:block xl:pt-2.5 xl:text-center">
                    <span className="xl:hidden">Line </span>
                    {index + 1}
                  </span>

                  <LineField label="Product">
                    <Select
                      value={item.productId}
                      onChange={(value) => handleProductChange(index, value)}
                      options={productOptions}
                      disabled={submitting || productsQuery.isLoading}
                      placeholder={
                        productsQuery.isLoading
                          ? 'Loading...'
                          : 'Select a product'
                      }
                      aria-invalid={Boolean(errors[`items.${index}.productId`])}
                    />
                    {product && (
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {product.productCode} · catalogue{' '}
                        {formatMoney(product.purchasePrice)}
                      </p>
                    )}
                    <FieldError message={errors[`items.${index}.productId`]} />
                  </LineField>

                  <LineField label="Quantity">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={item.quantity}
                      onChange={(event) =>
                        setItemField(index, 'quantity', event.target.value)
                      }
                      placeholder="0"
                      disabled={submitting}
                      aria-label={`Line ${index + 1} quantity`}
                      aria-invalid={Boolean(errors[`items.${index}.quantity`])}
                      className="text-right tabular-nums"
                    />
                    {product && (
                      <p className="mt-1 truncate text-xs text-slate-400 xl:text-right">
                        {product.unit}
                      </p>
                    )}
                    <FieldError message={errors[`items.${index}.quantity`]} />
                  </LineField>

                  <LineField label="Unit price (₹)">
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(event) =>
                        setItemField(index, 'unitPrice', event.target.value)
                      }
                      placeholder="0.00"
                      disabled={submitting}
                      aria-label={`Line ${index + 1} unit price`}
                      aria-invalid={Boolean(errors[`items.${index}.unitPrice`])}
                      className="text-right tabular-nums"
                    />
                    <FieldError message={errors[`items.${index}.unitPrice`]} />
                  </LineField>

                  <LineField label="Tax %">
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={100}
                      step="0.1"
                      value={item.taxRate}
                      onChange={(event) =>
                        setItemField(index, 'taxRate', event.target.value)
                      }
                      placeholder="0"
                      disabled={submitting}
                      aria-label={`Line ${index + 1} tax percent`}
                      aria-invalid={Boolean(errors[`items.${index}.taxRate`])}
                      className="text-right tabular-nums"
                    />
                    <FieldError message={errors[`items.${index}.taxRate`]} />
                  </LineField>

                  <LineField label="Discount %">
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={100}
                      step="0.1"
                      value={item.discountRate}
                      onChange={(event) =>
                        setItemField(index, 'discountRate', event.target.value)
                      }
                      placeholder="0"
                      disabled={submitting}
                      aria-label={`Line ${index + 1} discount percent`}
                      aria-invalid={Boolean(
                        errors[`items.${index}.discountRate`]
                      )}
                      className="text-right tabular-nums"
                    />
                    <FieldError
                      message={errors[`items.${index}.discountRate`]}
                    />
                  </LineField>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 xl:block xl:border-0 xl:pt-0">
                    <span className="text-xs text-slate-400 xl:hidden">
                      Line total
                    </span>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums xl:block xl:pt-2.5 xl:text-right">
                      {lineTotal !== null ? formatMoney(lineTotal) : '—'}
                    </span>
                  </div>

                  <div className="xl:pt-1.5 xl:text-right">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={submitting}
                        aria-label={`Remove line ${index + 1}`}
                        title="Remove line"
                        className="w-full gap-1.5 px-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 xl:h-7 xl:w-7 xl:p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="xl:hidden">Remove line</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-lg border-t border-slate-200/80 bg-slate-50/40 px-4 py-2.5">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700 tabular-nums">
                {items.length}
              </span>{' '}
              {items.length === 1 ? 'line' : 'lines'} ·{' '}
              <span className="font-semibold text-slate-700 tabular-nums">
                {formatQuantity(totalUnits)}
              </span>{' '}
              units
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              disabled={submitting}
              className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another item
            </Button>
          </div>
        </div>
      </FormSection>

      <FormSection
        icon={<IndianRupee className="h-4 w-4" />}
        title="Order summary"
        description="Calculated live from the items above."
        iconClassName="bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border"
      >
        <div className="max-w-sm space-y-2.5 sm:ml-auto">
          <TotalLine label="Subtotal" value={formatMoney(totals.gross)} />
          <TotalLine
            label="Discount"
            value={`−${formatMoney(totals.discount)}`}
          />
          <TotalLine label="Tax" value={`+${formatMoney(totals.tax)}`} />
          <TotalLine
            label="Grand total"
            value={formatMoney(totals.total)}
            emphasize
          />
        </div>
      </FormSection>

      <div className="flex flex-col-reverse items-stretch gap-2 rounded-xl border border-theme-border bg-theme-surface-muted p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Saved as a draft — stock is added to inventory once the order is
          completed.
        </p>
        <div className="flex items-center gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
