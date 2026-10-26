import api from '@/api/axiosInstance';
import type { PageResponse } from '@/types/product';
import type { AdjustStockRequest, InventoryItem } from '@/types/inventory';

/**
 * The backend response currently keeps the historical `prouctName` spelling.
 * Normalising it here keeps the rest of the client clean.
 */
interface InventoryResponseRaw {
  inventoryId: number;
  productId: number;
  prouctName?: string;
  productName?: string;
  unit: string;
  orgId: number;
  quantity: number;
  createdOn: string;
  modifiedOn: string;
}

function normalize(raw: InventoryResponseRaw): InventoryItem {
  return {
    inventoryId: raw.inventoryId,
    productId: raw.productId,
    productName: raw.productName ?? raw.prouctName ?? 'Unknown product',
    unit: raw.unit as InventoryItem['unit'],
    orgId: raw.orgId,
    quantity: raw.quantity,
    createdOn: raw.createdOn,
    modifiedOn: raw.modifiedOn,
  };
}

export const inventoryApi = {
  list: async (page = 0, size = 20): Promise<PageResponse<InventoryItem>> => {
    const { data } = await api.get<PageResponse<InventoryResponseRaw>>('/v1/inventory', {
      params: { page, size },
    });
    return { ...data, content: data.content.map(normalize) };
  },

  get: async (productId: number): Promise<InventoryItem> => {
    const { data } = await api.get<InventoryResponseRaw>(`/v1/inventory/${productId}`);
    return normalize(data);
  },

  addStock: async (
    productId: number,
    payload: AdjustStockRequest
  ): Promise<InventoryItem> => {
    const { data } = await api.post<InventoryResponseRaw>(
      `/v1/inventory/${productId}/add`,
      payload
    );
    return normalize(data);
  },

  removeStock: async (
    productId: number,
    payload: AdjustStockRequest
  ): Promise<InventoryItem> => {
    const { data } = await api.post<InventoryResponseRaw>(
      `/v1/inventory/${productId}/remove`,
      payload
    );
    return normalize(data);
  },

  lowStock: async (): Promise<InventoryItem[]> => {
    const { data } = await api.get<InventoryResponseRaw[]>('/v1/inventory/low-stock');
    return data.map(normalize);
  },
};
