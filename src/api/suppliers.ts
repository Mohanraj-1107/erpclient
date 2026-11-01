import api from '@/api/axiosInstance';
import type { PageResponse } from '@/types/product';
import type {
  CreateSupplierRequest,
  Supplier,
  UpdateSupplierRequest,
} from '@/types/supplier';

export const supplierApi = {
  list: async (page = 0, size = 20): Promise<PageResponse<Supplier>> => {
    const { data } = await api.get<PageResponse<Supplier>>('/v1/suppliers', {
      params: { page, size },
    });
    return data;
  },

  listAll: async (): Promise<Supplier[]> => {
    const size = 200;
    const suppliers: Supplier[] = [];
    let page = 0;

    while (true) {
      const { data } = await api.get<PageResponse<Supplier>>('/v1/suppliers', {
        params: { page, size },
      });
      suppliers.push(...data.content);
      if (data.last || data.content.length === 0) break;
      page += 1;
    }

    return suppliers;
  },

  get: async (supplierId: number): Promise<Supplier> => {
    const { data } = await api.get<Supplier>(`/v1/suppliers/${supplierId}`);
    return data;
  },

  create: async (payload: CreateSupplierRequest): Promise<Supplier> => {
    const { data } = await api.post<Supplier>('/v1/suppliers', payload);
    return data;
  },

  update: async (
    supplierId: number,
    payload: UpdateSupplierRequest
  ): Promise<Supplier> => {
    const { data } = await api.patch<Supplier>(
      `/v1/suppliers/${supplierId}`,
      payload
    );
    return data;
  },

  remove: async (supplierId: number): Promise<void> => {
    await api.delete(`/v1/suppliers/${supplierId}`);
  },
};
