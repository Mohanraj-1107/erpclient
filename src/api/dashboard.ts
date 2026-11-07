import api from '@/api/axiosInstance';
import type {
  DashboardSummary,
  DashboardSalesOverview,
  DashboardPurchaseOverview,
  DashboardInventoryOverview,
} from '@/types/dashboard';

export const dashboardApi = {
  /** Consolidated KPI summary (products, customers, suppliers, stock, revenue, spend). */
  summary: async (): Promise<DashboardSummary> => {
    const { data } = await api.get<DashboardSummary>('/v1/dashboard');
    return data;
  },

  /** Sales counts by status (DRAFT/COMPLETED/CANCELLED) + revenue & tax. */
  salesOverview: async (): Promise<DashboardSalesOverview> => {
    const { data } = await api.get<DashboardSalesOverview>('/v1/dashboard/sales');
    return data;
  },

  /** Purchase counts by status + spend & tax. */
  purchaseOverview: async (): Promise<DashboardPurchaseOverview> => {
    const { data } = await api.get<DashboardPurchaseOverview>('/v1/dashboard/purchases');
    return data;
  },

  /** Inventory health (total stock items, low-stock & out-of-stock products). */
  inventoryOverview: async (): Promise<DashboardInventoryOverview> => {
    const { data } = await api.get<DashboardInventoryOverview>('/v1/dashboard/inventory');
    return data;
  },
};
