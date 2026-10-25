export type ProductUnit = 'KG' | 'LITER' | 'PCS' | 'GRAMS';

export const PRODUCT_UNITS: ProductUnit[] = ['KG', 'LITER', 'PCS', 'GRAMS'];

export interface Product {
  productId: number;
  orgId: number;
  productCode: string;
  productName: string;
  purchasePrice: number;
  sellingPrice: number;
  taxRate: number;
  minimumStock: number;
  unit: ProductUnit;
  createdOn: string;
  modifiedOn: string;
}

export interface CreateProductRequest {
  productCode: string;
  productName: string;
  purchasePrice: number;
  sellingPrice: number;
  taxRate: number;
  minimumStock: number;
  unit: ProductUnit;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

/** Spring Data `Page<T>` serialized shape. */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
