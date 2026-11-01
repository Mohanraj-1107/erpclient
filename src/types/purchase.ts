export type PurchaseStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export const PURCHASE_STATUSES: PurchaseStatus[] = [
  'DRAFT',
  'COMPLETED',
  'CANCELLED',
];

/** One line item on a purchase order. */
export interface PurchaseItem {
  itemId?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
}

export interface Purchase {
  purchaseId: number;
  orgId?: number;
  supplierId: number;
  supplierName?: string;
  status: PurchaseStatus;
  items: PurchaseItem[];
  createdOn?: string;
  modifiedOn?: string;
}

export interface CreatePurchaseItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
}

export interface CreatePurchaseRequest {
  supplierId: number;
  items: CreatePurchaseItemRequest[];
}

export function formatPurchaseRef(purchaseId: number): string {
  return `PO-${String(purchaseId).padStart(6, '0')}`;
}

/** Line totals for one item, after discount and tax. */
export interface PurchaseLineTotals {
  gross: number;
  discount: number;
  tax: number;
  total: number;
}

/** Totals for an entire purchase order. */
export interface PurchaseTotals {
  gross: number;
  discount: number;
  tax: number;
  total: number;
}

export function getLineTotals(item: PurchaseItem): PurchaseLineTotals {
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

export function getPurchaseTotals(
  items: PurchaseItem[] | undefined
): PurchaseTotals {
  const totals: PurchaseTotals = { gross: 0, discount: 0, tax: 0, total: 0 };
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
