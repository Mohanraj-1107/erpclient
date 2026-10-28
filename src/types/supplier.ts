export interface SupplierAddress {
  street: string;
  city: string;
  district: string;
  pincode: string;
  state: string;
  country: string;
}

export interface Supplier {
  supplierId: number;
  orgId: number;
  supplierName: string;
  supplierEmail: string;
  mobileNo: string;
  gstNo: string;
  address: SupplierAddress[] | null;
  createdOn: string;
  modifiedOn: string;
}

export interface CreateSupplierRequest {
  supplierName: string;
  supplierEmail: string;
  mobileNo: string;
  gstNo: string;
  address: SupplierAddress[];
}

export type UpdateSupplierRequest = Partial<CreateSupplierRequest>;
