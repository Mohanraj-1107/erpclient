import api from '@/api/axiosInstance';
import type {
  CreateProductRequest,
  PageResponse,
  Product,
  UpdateProductRequest,
} from '@/types/product';

export const productApi = {
  list: async (page = 0, size = 20): Promise<PageResponse<Product>> => {
    const { data } = await api.get<PageResponse<Product>>('/v1/products', {
      params: { page, size },
    });
    return data;
  },

  get: async (productId: number): Promise<Product> => {
    const { data } = await api.get<Product>(`/v1/products/${productId}`);
    return data;
  },

  create: async (payload: CreateProductRequest): Promise<Product> => {
    const { data } = await api.post<Product>('/v1/products', payload);
    return data;
  },

  update: async (productId: number, payload: UpdateProductRequest): Promise<Product> => {
    const { data } = await api.patch<Product>(`/v1/products/${productId}`, payload);
    return data;
  },

  remove: async (productId: number): Promise<void> => {
    await api.delete(`/v1/products/${productId}`);
  },
};
