import type { ProductUnit } from './product';

export interface InventoryItem {
  inventoryId: number;
  productId: number;
  productName: string;
  unit: ProductUnit;
  orgId: number;
  quantity: number;
  createdOn: string;
  modifiedOn: string;
}

export interface AdjustStockRequest {
  quantity: number;
}

export type StockAdjustmentMode = 'add' | 'remove';
