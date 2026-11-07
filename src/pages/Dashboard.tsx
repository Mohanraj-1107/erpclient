import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CreditCard,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
  TrendingDown,
  Users,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '@/api/dashboard';
import { cn, formatMoney, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/common/Alert';
import type {
  DashboardSummary,
  DashboardSalesOverview,
  DashboardPurchaseOverview,
  DashboardInventoryOverview,
} from '@/types/dashboard';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#f59e0b',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

type ViewMode = 'percentage' | 'amount';

interface ChartLegendItem {
  name: string;
  value: number;
  amount?: number;
  color: string;
  total: number;
  viewMode: ViewMode;
}

function ChartLegendItem({ item }: { item: ChartLegendItem }) {
  const percentage = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
  const showPercentage = item.viewMode === 'percentage';
  const displayAmount = formatMoney(item.amount ?? item.value);
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-theme-border/80 bg-theme-surface">
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-xs font-medium text-theme-text truncate">
          {item.name}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
        {showPercentage ? (
          <span className="font-bold text-theme-text">{percentage}%</span>
        ) : (
          <span className="font-bold text-theme-text">{displayAmount}</span>
        )}
      </div>
    </div>
  );
}

function ViewModeToggle({
  current,
  onChange,
}: {
  current: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <div className="flex items-center border border-theme-border rounded-md bg-theme-surface p-0.5">
        {(['percentage', 'amount'] as ViewMode[]).map((mode) => {
          const isActive = current === mode;
          return (
            <button
              key={mode}
              onClick={() => onChange(mode)}
              className={cn(
                'h-6 px-2 text-[10px] font-medium transition-all rounded-md',
                isActive
                  ? 'bg-theme-primary text-theme-primary-fg shadow-xs'
                  : 'text-theme-text-muted hover:bg-theme-surface-hover hover:text-theme-text'
              )}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface KPICard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  colorName: string;
  money?: boolean;
  bg: string;
}

function KPISkeleton() {
  return (
    <Card className="p-4 bg-theme-surface/50 backdrop-blur-sm border border-theme-border/60">
      <div className="flex items-center justify-between space-x-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="h-9 w-9 rounded-lg bg-theme-surface-hover border border-theme-border/40">
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function PanelSkeleton() {
  return (
    <Card>
      <CardContent className="pt-0 pb-5">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="col-span-1">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [salesViewMode, setSalesViewMode] = useState<ViewMode>('amount');
  const [purchasesViewMode, setPurchasesViewMode] = useState<ViewMode>('amount');

  const summaryQuery = useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.summary,
    staleTime: 1000 * 60,
  });

  const salesQuery = useQuery<DashboardSalesOverview>({
    queryKey: ['dashboard', 'sales'],
    queryFn: dashboardApi.salesOverview,
    staleTime: 1000 * 60,
  });

  const purchasesQuery = useQuery<DashboardPurchaseOverview>({
    queryKey: ['dashboard', 'purchases'],
    queryFn: dashboardApi.purchaseOverview,
    staleTime: 1000 * 60,
  });

  const inventoryQuery = useQuery<DashboardInventoryOverview>({
    queryKey: ['dashboard', 'inventory'],
    queryFn: dashboardApi.inventoryOverview,
    staleTime: 1000 * 60,
  });

  const summary = summaryQuery.data;
  const sales = salesQuery.data;
  const purchases = purchasesQuery.data;
  const inventory = inventoryQuery.data;

  const statCards: KPICard[] = [
    {
      label: 'Total Products',
      value: summary?.totalProducts ?? 0,
      icon: Box,
      color: '#4f46e5',
      colorName: 'indigo',
      bg: 'bg-indigo-50/40',
    },
    {
      label: 'Total Customers',
      value: summary?.totalCustomers ?? 0,
      icon: Users,
      color: '#7c3aed',
      colorName: 'purple',
      bg: 'bg-purple-50/40',
    },
    {
      label: 'Total Suppliers',
      value: summary?.totalSuppliers ?? 0,
      icon: Truck,
      color: '#d97706',
      colorName: 'amber',
      bg: 'bg-amber-50/40',
    },
    {
      label: 'Low Stock',
      value: summary?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: '#f59e0b',
      colorName: 'amber',
      bg: 'bg-amber-50/40',
    },
    {
      label: 'Out of Stock',
      value: summary?.outOfStockCount ?? 0,
      icon: TrendingDown,
      color: '#ef4444',
      colorName: 'rose',
      bg: 'bg-rose-50/40',
    },
    {
      label: 'Completed Sales',
      value: summary?.completedSalesCount ?? 0,
      icon: CreditCard,
      color: '#10b981',
      colorName: 'emerald',
      bg: 'bg-emerald-50/40',
    },
    {
      label: 'Total Revenue',
      value: summary?.totalRevenue ?? 0,
      icon: DollarSign,
      color: '#ef4444',
      colorName: 'rose',
      money: true,
      bg: 'bg-rose-50/40',
    },
    {
      label: 'Purchase Spend',
      value: summary?.totalPurchaseSpend ?? 0,
      icon: ShoppingCart,
      color: '#7c3aed',
      colorName: 'purple',
      money: true,
      bg: 'bg-purple-50/40',
    },
  ];

  const salesData =
    sales && sales.salesByStatus.length > 0
      ? sales.salesByStatus.map((item) => ({
          name: STATUS_LABELS[item.status] ?? item.status,
          value: item.amount ?? item.count,
          color: STATUS_COLORS[item.status] ?? STATUS_COLORS.DRAFT,
          amount: item.amount,
          total: salesDataTotal(sales),
          viewMode: salesViewMode,
        }))
      : [];

  const purchasesData =
    purchases && purchases.purchasesByStatus.length > 0
      ? purchases.purchasesByStatus.map((item) => ({
          name: STATUS_LABELS[item.status] ?? item.status,
          value: item.amount ?? item.count,
          color: STATUS_COLORS[item.status] ?? STATUS_COLORS.DRAFT,
          amount: item.amount,
          total: purchasesDataTotal(purchases),
          viewMode: purchasesViewMode,
        }))
      : [];

  const handleRefresh = () => {
    summaryQuery.refetch();
    salesQuery.refetch();
    purchasesQuery.refetch();
    inventoryQuery.refetch();
  };

  const isRefreshing =
    summaryQuery.isFetching ||
    salesQuery.isFetching ||
    purchasesQuery.isFetching ||
    inventoryQuery.isFetching;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-sm font-semibold text-theme-text tracking-tight">Dashboard</h1>
          {summary && (
            <p className="text-[10px] text-theme-text-muted mt-0.5">
              Data as of {formatDateTime(summary.generatedAt)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {summaryQuery.isError && (
            <Alert tone="error" className="text-xs p-2">
              Failed to load dashboard summary.
            </Alert>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5 px-3 py-1.5"
          >
            <RefreshCw className={cn('', summaryQuery.isFetching && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryQuery.isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <KPISkeleton key={i} />)
        ) : (
          statCards.map((card) => (
            <Card key={card.label} className={`p-4 bg-theme-surface/50 backdrop-blur-sm border border-theme-border/60 ${card.bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-theme-text-muted uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className="mt-1.5">
                    <span className="text-lg font-bold text-theme-text tabular-nums">
                      {card.money ? formatMoney(card.value as number) : card.value}
                    </span>
                  </div>
                </div>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.color}10 border border-theme-border/40`}>
                  <card.icon className={`w-4 h-4 text-[${card.color}]`} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Overview panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sales overview */}
        <Card className="lg:col-span-2 bg-indigo-50/30 border-indigo-100/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Sales Overview
            </CardTitle>
            <CardDescription>
              Sales amounts by status and completed-sale revenue.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-5">
            {salesQuery.isLoading ? (
              <PanelSkeleton />
            ) : salesQuery.isError ? (
              <div className="p-4">
                <Alert tone="error">
                  Failed to load sales overview.
                </Alert>
              </div>
            ) : sales ? (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Tooltip content={renderChartTooltip} />
                        <Pie
                          data={salesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {salesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-theme-text-muted uppercase tracking-wider">
                      Status breakdown
                    </p>
                    <ViewModeToggle
                      current={salesViewMode}
                      onChange={setSalesViewMode}
                    />
                  </div>
                  <div className="space-y-2">
                    {salesData.map((item) => (
                      <ChartLegendItem key={item.name} item={item} />
                    ))}
                  </div>
                  <div className="mt-4 border-t border-theme-border-subtle pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-theme-text-muted">
                        Total orders
                      </span>
                      <span className="text-xs font-bold text-theme-text tabular-nums">
                        {sales.totalSalesCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-medium text-theme-text-muted">
                        Revenue
                      </span>
                      <span className="text-xs font-bold text-theme-text tabular-nums">
                        {formatMoney(sales.totalRevenue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-theme-text-muted text-xs">No sales data</div>
            )}
          </CardContent>
        </Card>

        {/* Purchases overview */}
        <Card className="lg:col-span-2 bg-amber-50/30 border-amber-100/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Purchases Overview
            </CardTitle>
            <CardDescription>
              Purchase amounts by status and completed-purchase spend.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-5">
            {purchasesQuery.isLoading ? (
              <PanelSkeleton />
            ) : purchasesQuery.isError ? (
              <div className="p-4">
                <Alert tone="error">
                  Failed to load purchases overview.
                </Alert>
              </div>
            ) : purchases ? (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Tooltip content={renderChartTooltip} />
                        <Pie
                          data={purchasesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {purchasesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-theme-text-muted uppercase tracking-wider">
                      Status breakdown
                    </p>
                    <ViewModeToggle
                      current={purchasesViewMode}
                      onChange={setPurchasesViewMode}
                    />
                  </div>
                  <div className="space-y-2">
                    {purchasesData.map((item) => (
                      <ChartLegendItem key={item.name} item={item} />
                    ))}
                  </div>
                  <div className="mt-4 border-t border-theme-border-subtle pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-theme-text-muted">
                        Total orders
                      </span>
                      <span className="text-xs font-bold text-theme-text tabular-nums">
                        {purchases.totalPurchaseCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-medium text-theme-text-muted">
                        Spend
                      </span>
                      <span className="text-xs font-bold text-theme-text tabular-nums">
                        {formatMoney(purchases.totalSpend)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-theme-text-muted text-xs">No purchase data</div>
            )}
          </CardContent>
        </Card>

        {/* Inventory health */}
        <Card className="lg:col-span-4 bg-emerald-50/30 border-emerald-100/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-4 h-4" /> Inventory Health
            </CardTitle>
            <CardDescription>
              Stock position and products at or below minimum stock.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-5">
            {inventoryQuery.isLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <MiniStatSkeleton key={i} />
                ))}
              </div>
            ) : inventoryQuery.isError ? (
              <div className="p-4">
                <Alert tone="error">
                  Failed to load inventory overview.
                </Alert>
              </div>
            ) : inventory ? (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <MiniStat label="Stock items" value={inventory.totalStockItems} money={false} />
                  <MiniStat label="Low stock" value={inventory.lowStockCount} money={false} accent="amber" />
                  <MiniStat label="Out of stock" value={inventory.outOfStockCount} money={false} accent="rose" />
                </div>

                {inventory.lowStockProducts.length > 0 ? (
                  <div className="border-t border-theme-border-subtle pt-4">
                    <p className="text-[10px] font-semibold text-theme-text-muted uppercase tracking-wider mb-3">
                      Low-stock products
                    </p>
                    <div className="space-y-2">
                      {inventory.lowStockProducts.map((product) => (
                        <div
                          key={product.productId}
                          className="flex items-center justify-between px-3 py-2 rounded-lg border border-theme-border/80 bg-theme-surface text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-theme-text truncate">
                              {product.productName}
                            </span>
                            <span className="text-[10px] text-theme-text-muted">
                              #{product.productId}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-mono tabular-nums text-theme-text-muted">
                            <span>Qty: {product.quantity}</span>
                            <span className="text-theme-text-subtle">/</span>
                            <span>Min: {product.minimumStock}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 rounded-lg border border-theme-border/80 bg-theme-surface-hover text-center">
                    <p className="text-[10px] text-theme-text-muted">No low-stock products.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-theme-text-muted text-xs">No inventory data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions block */}
      <Card className="bg-theme-surface/50 backdrop-blur-sm border border-theme-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> Quick actions
          </CardTitle>
          <CardDescription className="text-[10px]">Jump to a module</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Products', href: '/products', icon: <Box className="w-4 h-4" /> },
              { label: 'Inventory', href: '/inventory', icon: <Package className="w-4 h-4" /> },
              { label: 'Customers', href: '/customers', icon: <Users className="w-4 h-4" /> },
              { label: 'Suppliers', href: '/suppliers', icon: <Truck className="w-4 h-4" /> },
              { label: 'Purchases', href: '/purchases', icon: <ShoppingCart className="w-4 h-4" /> },
              { label: 'Sales', href: '/sales', icon: <CreditCard className="w-4 h-4" /> },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.href)}
                className="flex flex-col items-center justify-center gap-1.5 px-3 py-3.5 text-sm text-theme-text-muted bg-theme-surface border border-theme-border/80 rounded-lg hover:bg-theme-surface-hover hover:text-theme-text hover:border-theme-border transition-colors"
              >
                {action.icon}
                <span className="font-medium text-[11px] leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function salesDataTotal(sales: DashboardSalesOverview): number {
  return sales.salesByStatus.reduce((sum, item) => sum + (item.amount ?? item.count), 0);
}

function purchasesDataTotal(purchases: DashboardPurchaseOverview): number {
  return purchases.purchasesByStatus.reduce(
    (sum, item) => sum + (item.amount ?? item.count),
    0
  );
}

interface MiniStatProps {
  label: string;
  value: number | string;
  money?: boolean;
  accent?: 'amber' | 'rose';
}

function MiniStat({ label, value, money, accent }: MiniStatProps) {
  const accentMap: Record<'amber' | 'rose', string> = {
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    rose: 'bg-rose-50 border-rose-100 text-rose-700',
  };
  const baseClass = 'bg-theme-surface-hover border-theme-border text-theme-text-muted';
  const accentClass = accent ? accentMap[accent] : baseClass;

  return (
    <div className={`rounded-lg border p-3 ${accentClass}`}>
      <div className="text-[10px] font-semibold text-theme-text-muted uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1 text-xs font-bold text-theme-text tabular-nums">
        {money ? formatMoney(typeof value === 'number' ? value : Number(value)) : value}
      </div>
    </div>
  );
}

function MiniStatSkeleton() {
  return (
    <div className="rounded-lg border p-3 bg-theme-surface-hover">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-1 h-4 w-16" />
    </div>
  );
}

interface ChartTooltipPayload {
  name?: string;
  value?: number;
}

function renderChartTooltip(props: {
  active: boolean;
  payload: unknown;
}): React.ReactNode {
  if (
    !props.active ||
    !props.payload ||
    !Array.isArray(props.payload) ||
    props.payload.length === 0
  ) {
    return null;
  }
  const item = props.payload[0] as { payload?: ChartTooltipPayload } | undefined;
  const data = item?.payload;
  if (!data) return null;
  const { name, value } = data;
  const totalValue = (props.payload as { payload?: { value?: number } }[]).reduce(
    (sum, p) => sum + (Number(p.payload?.value) || 0),
    0
  );
  const percentage = totalValue > 0 ? Math.round((Number(value) / totalValue) * 100) : 0;
  return (
    <div className="p-3 border border-theme-border bg-theme-surface shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-theme-text">{String(name ?? '—')}</span>
        <span className="font-bold text-theme-primary">{percentage}%</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-theme-text-muted">Amount</span>
        <span className="text-xs font-bold text-theme-text tabular-nums">
          {formatMoney(Number(value ?? 0))}
        </span>
      </div>
    </div>
  );
}
