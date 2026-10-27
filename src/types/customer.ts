export interface CustomerAddress {
  street: string;
  city: string;
  district: string;
  pincode: string;
  state: string;
  country: string;
}

export interface Customer {
  customerId: number;
  orgId: number;
  customerName: string;
  customerEmail: string;
  mobileNo: string;
  gstNo: string;
  address: CustomerAddress[] | null;
  createdOn: string;
  modifiedOn: string;
}

export interface CreateCustomerRequest {
  customerName: string;
  customerEmail: string;
  mobileNo: string;
  gstNo: string;
  address: CustomerAddress[];
}

export type UpdateCustomerRequest = Partial<CreateCustomerRequest>;
