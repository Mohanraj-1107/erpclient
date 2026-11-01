import api from '@/api/axiosInstance';
import type { PageResponse } from '@/types/product';
import type {
  CreateSaleRequest,
  Sale,
} from '@/types/sales';

export const saleApi = {
  list: async (page = 0, size = 20): Promise<PageResponse<Sale>> => {
    const { data } = await api.get<PageResponse<Sale>>('/v1/sales', {
      params: { page, size },
    });
    return data;
  },

  get: async (saleId: number): Promise<Sale> => {
    const { data } = await api.get<Sale>(`/v1/sales/${saleId}`);
    return data;
  },

  update: async (
    saleId: number,
    payload: Partial<CreateSaleRequest>
  ): Promise<Sale> => {
    const { data } = await api.patch<Sale>(`/v1/sales/${saleId}`, payload);
    return data;
  },

  create: async (payload: CreateSaleRequest): Promise<Sale> => {
    const { data } = await api.post<Sale>('/v1/sales', payload);
    return data;
  },

  confirm: async (saleId: number): Promise<Sale> => {
    const { data } = await api.post<Sale>(
      `/v1/sales/${saleId}/confirm`,
      undefined
    );
    return data;
  },

  cancel: async (saleId: number): Promise<Sale> => {
    const { data } = await api.post<Sale>(
      `/v1/sales/${saleId}/cancel`,
      undefined
    );
    return data;
  },

  remove: async (saleId: number): Promise<void> => {
    await api.delete(`/v1/sales/${saleId}`);
  },
};
