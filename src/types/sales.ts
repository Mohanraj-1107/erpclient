export type SaleStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export const SALE_STATUSES: SaleStatus[] = ['DRAFT', 'COMPLETED', 'CANCELLED'];

/** One line item on a sales order. */
export interface SaleItem {
  itemId?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
}

export interface Sale {
  saleId: number;
  orgId?: number;
  customerId: number;
  customerName?: string;
  status: SaleStatus;
  items: SaleItem[];
  createdOn?: string;
  modifiedOn?: string;
}

export interface CreateSaleItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
}

export interface CreateSaleRequest {
  customerId: number;
  items: CreateSaleItemRequest[];
}

export function formatSaleRef(saleId: number): string {
  return `SO-${String(saleId).padStart(6, '0')}`;
}

/** Line totals for one item, after discount and tax. */
export interface SaleLineTotals {
  gross: number;
  discount: number;
  tax: number;
  total: number;
}

/** Totals for an entire sales order. */
export interface SaleTotals {
  gross: number;
  discount: number;
  tax: number;
  total: number;
}

export function getLineTotals(item: SaleItem): SaleLineTotals {
  const gross = item.quantity * item.unitPrice;
  const discount = gross * (item.discountRate / 100);
  const taxable = gross - discount;
  const tax = taxable * (item.taxRate / 100);
  return {
    gross,
    discount,
    tax,
    total: taxable + tax,
  };
}

export function getSaleTotals(
  items: SaleItem[] | undefined
): SaleTotals {
  const totals: SaleTotals = { gross: 0, discount: 0, tax: 0, total: 0 };
  if (!items) return totals;

  items.forEach((item) => {
    const line = getLineTotals(item);
    totals.gross += line.gross;
    totals.discount += line.discount;
    totals.tax += line.tax;
    totals.total += line.total;
  });

  return totals;
}
