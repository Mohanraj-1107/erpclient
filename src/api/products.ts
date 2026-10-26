import api from '@/api/axiosInstance';
import type {
  CreateProductRequest,
  PageResponse,
  Product,
  UpdateProductRequest,
} from '@/types/product';

async function listAllProducts(): Promise<Product[]> {
  const size = 200;
  const products: Product[] = [];
  let page = 0;

  while (true) {
    const { data } = await api.get<PageResponse<Product>>('/v1/products', {
      params: { page, size },
    });
    products.push(...data.content);
    if (data.last || data.content.length === 0) break;
    page += 1;
  }

  return products;
}

export const productApi = {
  list: async (page = 0, size = 20): Promise<PageResponse<Product>> => {
    const { data } = await api.get<PageResponse<Product>>('/v1/products', {
      params: { page, size },
    });
    return data;
  },

  listAll: listAllProducts,

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
