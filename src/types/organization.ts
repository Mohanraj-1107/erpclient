export interface OrgAddress {
  street: string;
  city: string;
  district: string;
  pincode: string;
  state: string | null;
  country: string;
}

export interface Organization {
  org_id: number;
  org_name: string;
  org_email: string;
  org_address: OrgAddress[] | null;
  mobile_no: string;
  created_on: string;
}
