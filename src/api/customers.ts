import api from '@/api/axiosInstance';
import type { PageResponse } from '@/types/product';
import type {
  CreateCustomerRequest,
  Customer,
  UpdateCustomerRequest,
} from '@/types/customer';

export const customerApi = {
  list: async (page = 0, size = 20): Promise<PageResponse<Customer>> => {
    const { data } = await api.get<PageResponse<Customer>>('/v1/customers', {
      params: { page, size },
    });
    return data;
  },

  get: async (customerId: number): Promise<Customer> => {
    const { data } = await api.get<Customer>(`/v1/customers/${customerId}`);
    return data;
  },

  create: async (payload: CreateCustomerRequest): Promise<Customer> => {
    const { data } = await api.post<Customer>('/v1/customers', payload);
    return data;
  },

  update: async (
    customerId: number,
    payload: UpdateCustomerRequest
  ): Promise<Customer> => {
    const { data } = await api.patch<Customer>(
      `/v1/customers/${customerId}`,
      payload
    );
    return data;
  },

  remove: async (customerId: number): Promise<void> => {
    await api.delete(`/v1/customers/${customerId}`);
  },
};
