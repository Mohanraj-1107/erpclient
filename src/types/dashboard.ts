export interface StatusCount {
  status: string;
  count: number;
  amount?: number;
}

export interface LowStockProduct {
  productId: number;
  productName: string;
  quantity: number;
  minimumStock: number;
}

/** Consolidated KPI summary for the organisation dashboard. */
export interface DashboardSummary {
  totalProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  lowStockCount: number;
  outOfStockCount: number;
  completedSalesCount: number;
  totalRevenue: number;
  completedPurchaseCount: number;
  totalPurchaseSpend: number;
  generatedAt: string;
}

/** Sales analytics overview scoped to the current organisation. */
export interface DashboardSalesOverview {
  totalSalesCount: number;
  draftSalesCount: number;
  completedSalesCount: number;
  cancelledSalesCount: number;
  totalRevenue: number;
  totalTax: number;
  salesByStatus: StatusCount[];
}

/** Purchase analytics overview scoped to the current organisation. */
export interface DashboardPurchaseOverview {
  totalPurchaseCount: number;
  draftPurchaseCount: number;
  completedPurchaseCount: number;
  cancelledPurchaseCount: number;
  totalSpend: number;
  totalTax: number;
  purchasesByStatus: StatusCount[];
}

/** Inventory health overview scoped to the current organisation. */
export interface DashboardInventoryOverview {
  totalStockItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: LowStockProduct[];
}
