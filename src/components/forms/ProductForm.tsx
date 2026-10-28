import { useState, type FormEvent } from 'react';
import { IndianRupee, Package, Save, TrendingUp } from 'lucide-react';
import type { CreateProductRequest, Product, ProductUnit } from '@/types/product';
import { PRODUCT_UNITS } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/ui/form-field';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/ui/spinner';
import { FormSection } from '@/components/forms/FormSection';
import { cn, formatMoney } from '@/lib/utils';

interface ProductFormProps {
  initial?: Product;
  submitting?: boolean;
  submitLabel: string;
  serverError?: string;
  onSubmit: (payload: CreateProductRequest) => void;
  onCancel: () => void;
}

interface FormState {
  productCode: string;
  productName: string;
  purchasePrice: string;
  sellingPrice: string;
  taxRate: string;
  minimumStock: string;
  unit: ProductUnit;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const UNIT_LABELS: Record<ProductUnit, string> = {
  KG: 'Kilograms (KG)',
  LITER: 'Litres (LITER)',
  PCS: 'Pieces (PCS)',
  GRAMS: 'Grams (GRAMS)',
};

function toFormState(product?: Product): FormState {
  return {
    productCode: product?.productCode ?? '',
    productName: product?.productName ?? '',
    purchasePrice: product !== undefined ? String(product.purchasePrice) : '',
    sellingPrice: product !== undefined ? String(product.sellingPrice) : '',
    taxRate: product !== undefined ? String(product.taxRate) : '0',
    minimumStock: product !== undefined ? String(product.minimumStock) : '0',
    unit: product?.unit ?? 'KG',
  };
}

function validate(state: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!state.productCode.trim()) {
    errors.productCode = 'Product code is required';
  } else if (state.productCode.trim().length > 50) {
    errors.productCode = 'Product code must be at most 50 characters';
  }

  if (!state.productName.trim()) {
    errors.productName = 'Product name is required';
  } else if (state.productName.trim().length > 100) {
    errors.productName = 'Product name must be at most 100 characters';
  }

  const purchasePrice = Number(state.purchasePrice);
  if (!state.purchasePrice || Number.isNaN(purchasePrice) || purchasePrice <= 0) {
    errors.purchasePrice = 'Purchase price must be greater than 0';
  }

  const sellingPrice = Number(state.sellingPrice);
  if (!state.sellingPrice || Number.isNaN(sellingPrice) || sellingPrice <= 0) {
    errors.sellingPrice = 'Selling price must be greater than 0';
  }

  const taxRate = Number(state.taxRate);
  if (state.taxRate === '' || Number.isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
    errors.taxRate = 'Tax rate must be between 0 and 100';
  }

  const minimumStock = Number(state.minimumStock);
  if (state.minimumStock === '' || Number.isNaN(minimumStock) || minimumStock < 0) {
    errors.minimumStock = 'Minimum stock cannot be negative';
  }

  return errors;
}

export function ProductForm({
  initial,
  submitting,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      productCode: form.productCode.trim(),
      productName: form.productName.trim(),
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      taxRate: Number(form.taxRate),
      minimumStock: Number(form.minimumStock),
      unit: form.unit,
    });
  };

  const purchase = Number(form.purchasePrice);
  const selling = Number(form.sellingPrice);
  const hasPrices =
    form.purchasePrice.trim() !== '' &&
    form.sellingPrice.trim() !== '' &&
    !Number.isNaN(purchase) &&
    !Number.isNaN(selling) &&
    purchase > 0;
  const profit = hasPrices ? selling - purchase : null;
  const margin = profit !== null ? (profit / purchase) * 100 : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <FormSection
        icon={<Package className="h-4 w-4" />}
        title="Product information"
        description="Identifiers used across inventory, purchases, and sales."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Product Code"
            htmlFor="productCode"
            required
            error={errors.productCode}
            hint={`${form.productCode.length}/50 characters`}
          >
            <Input
              id="productCode"
              value={form.productCode}
              onChange={(event) => setField('productCode', event.target.value)}
              placeholder="e.g. SKU-001"
              maxLength={50}
              autoComplete="off"
              autoFocus
              disabled={submitting}
              aria-invalid={Boolean(errors.productCode)}
            />
          </FormField>

          <FormField
            label="Product Name"
            htmlFor="productName"
            required
            error={errors.productName}
            hint={`${form.productName.length}/100 characters`}
          >
            <Input
              id="productName"
              value={form.productName}
              onChange={(event) => setField('productName', event.target.value)}
              placeholder="e.g. Basmati Rice"
              maxLength={100}
              autoComplete="off"
              disabled={submitting}
              aria-invalid={Boolean(errors.productName)}
            />
          </FormField>

          <FormField label="Unit" htmlFor="unit" required error={errors.unit}>
            <Select
              id="unit"
              value={form.unit}
              onChange={(unit) => setField('unit', unit as ProductUnit)}
              options={PRODUCT_UNITS.map((unit) => ({
                value: unit,
                label: UNIT_LABELS[unit],
              }))}
              disabled={submitting}
              aria-invalid={Boolean(errors.unit)}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        icon={<IndianRupee className="h-4 w-4" />}
        title="Pricing & stock"
        description="Set prices, tax, and the low-stock alert threshold."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Purchase Price"
            htmlFor="purchasePrice"
            required
            error={errors.purchasePrice}
            hint="Cost price per unit (₹)"
          >
            <Input
              id="purchasePrice"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={form.purchasePrice}
              onChange={(event) => setField('purchasePrice', event.target.value)}
              placeholder="0.00"
              disabled={submitting}
              aria-invalid={Boolean(errors.purchasePrice)}
            />
          </FormField>

          <FormField
            label="Selling Price"
            htmlFor="sellingPrice"
            required
            error={errors.sellingPrice}
            hint="Selling price per unit (₹)"
          >
            <Input
              id="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={form.sellingPrice}
              onChange={(event) => setField('sellingPrice', event.target.value)}
              placeholder="0.00"
              disabled={submitting}
              aria-invalid={Boolean(errors.sellingPrice)}
            />
          </FormField>

          <FormField
            label="Tax Rate (%)"
            htmlFor="taxRate"
            required
            error={errors.taxRate}
            hint="Between 0 and 100"
          >
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              inputMode="decimal"
              value={form.taxRate}
              onChange={(event) => setField('taxRate', event.target.value)}
              placeholder="0"
              disabled={submitting}
              aria-invalid={Boolean(errors.taxRate)}
            />
          </FormField>

          <FormField
            label="Minimum Stock"
            htmlFor="minimumStock"
            required
            error={errors.minimumStock}
            hint="Low-stock alert threshold"
          >
            <Input
              id="minimumStock"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={form.minimumStock}
              onChange={(event) => setField('minimumStock', event.target.value)}
              placeholder="0"
              disabled={submitting}
              aria-invalid={Boolean(errors.minimumStock)}
            />
          </FormField>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3.5 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
            Margin preview
          </div>
          {profit !== null && margin !== null ? (
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'text-xs font-semibold tabular-nums',
                  profit >= 0 ? 'text-status-success-fg' : 'text-status-error-fg'
                )}
              >
                {formatMoney(profit)} profit / unit
              </span>
              <Badge variant={profit >= 0 ? 'success' : 'danger'}>
                {profit >= 0 ? '+' : ''}
                {margin.toFixed(1)}%
              </Badge>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              Enter purchase and selling price to preview margin
            </span>
          )}
        </div>
      </FormSection>

      <div className="flex flex-col-reverse items-stretch gap-2 rounded-xl border border-slate-200/80 bg-slate-100/80 p-4 shadow-xs backdrop-blur-sm sm:flex-row sm:items-center sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="gap-2">
          {submitting ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
