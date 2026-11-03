import  { api,authClient } from '@/api/axiosInstance';
import type { Organization } from '@/types/organization';

export interface CreateOrgRequest {
  orgName: string;
  orgEmail: string;
  orgPassword: string;
  mobileNo: string;
  address: Array<{
    street: string;
    city: string;
    district: string;
    pincode: string;
    state: string;
    country: string;
  }>;
}

export const orgApi = {
  get: async (orgId: number): Promise<Organization> => {
    const { data } = await api.get<Organization>(`/v1/org/${orgId}`);
    return data;
  },
  create: async (payload: CreateOrgRequest): Promise<Organization> => {
    const { data } = await authClient.post<Organization>('/v1/org', payload);
    return data;
  },
};
