import api from '@/api/axiosInstance';
import type { PageResponse } from '@/types/product';
import type {
  CreatePurchaseRequest,
  Purchase,
} from '@/types/purchase';

export const purchaseApi = {
  list: async (page = 0, size = 20): Promise<PageResponse<Purchase>> => {
    const { data } = await api.get<PageResponse<Purchase>>('/v1/purchases', {
      params: { page, size },
    });
    return data;
  },

  get: async (purchaseId: number): Promise<Purchase> => {
    const { data } = await api.get<Purchase>(`/v1/purchases/${purchaseId}`);
    return data;
  },

  create: async (payload: CreatePurchaseRequest): Promise<Purchase> => {
    const { data } = await api.post<Purchase>('/v1/purchases', payload);
    return data;
  },

  complete: async (purchaseId: number): Promise<Purchase> => {
    const { data } = await api.post<Purchase>(
      `/v1/purchases/${purchaseId}/complete`,
      undefined
    );
    return data;
  },

  cancel: async (purchaseId: number): Promise<Purchase> => {
    const { data } = await api.post<Purchase>(
      `/v1/purchases/${purchaseId}/cancel`,
      undefined
    );
    return data;
  },

  remove: async (purchaseId: number): Promise<void> => {
    await api.delete(`/v1/purchases/${purchaseId}`);
  },
};
