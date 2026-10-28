import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Plus, RefreshCw, Search, TriangleAlert, X } from 'lucide-react';
import { inventoryApi } from '@/api/inventory';
import { cn, getApiErrorMessage } from '@/lib/utils';
import { useProductLookup } from '@/hooks/useProductLookup';
import { useStockAdjustment } from '@/hooks/useStockAdjustment';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/common/Alert';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import {
  InventoryTable,
  InventoryTableSkeleton,
} from '@/components/inventory/InventoryTable';
import { StockAdjustDialog } from '@/components/inventory/StockAdjustDialog';

const PAGE_SIZE = 20;

export default function InventoryList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const stockAdjustment = useStockAdjustment();
  const { productsById } = useProductLookup();

  const inventoryQuery = useQuery({
    queryKey: ['inventory', page, PAGE_SIZE],
    queryFn: () => inventoryApi.list(page, PAGE_SIZE),
  });

  const lowStockQuery = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.lowStock,
  });

  const items = inventoryQuery.data?.content ?? [];
  const lowStockItems = lowStockQuery.data ?? [];
  const lowStockCount = lowStockItems.length;
  const lowStockIds = lowStockQuery.data
    ? new Set(lowStockItems.map((item) => item.productId))
    : undefined;

  const query = search.trim().toLowerCase();
  const filtered = query
    ? items.filter((item) => {
        const product = productsById.get(item.productId);
        return (
          item.productName.toLowerCase().includes(query) ||
          (product?.productCode.toLowerCase().includes(query) ?? false)
        );
      })
    : items;

  const countLabel = inventoryQuery.data
    ? query
      ? `${filtered.length} of ${items.length} on this page`
      : `${inventoryQuery.data.totalElements} record${
          inventoryQuery.data.totalElements === 1 ? '' : 's'
        }`
    : '—';

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Inventory' }]}
        icon={<Package className="h-4 w-4" />}
        action={
          <>
            {inventoryQuery.data && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100">
                {inventoryQuery.data.totalElements} record
                {inventoryQuery.data.totalElements === 1 ? '' : 's'}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/inventory/low-stock')}
              className={cn(
                'gap-1.5',
                lowStockCount > 0
                  ? 'border-status-warning-border bg-status-warning text-status-warning-fg hover:border-status-warning-border hover:bg-status-warning/80 hover:text-status-warning-fg'
                  : 'text-slate-600'
              )}
            >
              <TriangleAlert className="h-3.5 w-3.5" />
              Low stock
              {lowStockCount > 0 && (
                <span className="rounded-full bg-status-warning-border/80 px-1.5 py-0.5 text-[10px] font-bold text-status-warning-fg">
                  {lowStockCount}
                </span>
              )}
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search this page by product or code"
              aria-label="Search inventory"
              className="pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">{countLabel}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inventoryQuery.refetch()}
              disabled={inventoryQuery.isFetching}
              className="gap-1.5"
            >
              <RefreshCw
                className={cn(
                  'h-3.5 w-3.5',
                  inventoryQuery.isFetching && 'animate-spin'
                )}
              />
              Refresh
            </Button>
          </div>
        </div>

        {inventoryQuery.isLoading ? (
          <InventoryTableSkeleton />
        ) : inventoryQuery.isError ? (
          <div className="p-4">
            <Alert tone="error">
              {getApiErrorMessage(
                inventoryQuery.error,
                'Failed to load inventory.'
              )}
            </Alert>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={items.length === 0 ? 'No inventory records yet' : 'No matching items'}
            description={
              items.length === 0
                ? 'Inventory is created automatically when you add a product.'
                : 'No inventory item on this page matches your search.'
            }
            icon={<Package className="h-5 w-5" />}
            action={
              items.length === 0 ? (
                <Button
                  onClick={() => navigate('/products/create')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add a product
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              )
            }
          />
        ) : (
          <InventoryTable
            items={filtered}
            productsById={productsById}
            lowStockIds={lowStockIds}
            onAdjust={stockAdjustment.openAdjustment}
            disabled={stockAdjustment.isPending}
          />
        )}

        {inventoryQuery.data &&
          !inventoryQuery.isLoading &&
          !inventoryQuery.isError && (
            <Pagination
              page={inventoryQuery.data.number}
              size={inventoryQuery.data.size}
              totalElements={inventoryQuery.data.totalElements}
              totalPages={inventoryQuery.data.totalPages}
              onPageChange={setPage}
              disabled={stockAdjustment.isPending}
            />
          )}
      </Card>

      <StockAdjustDialog
        key={
          stockAdjustment.adjustment
            ? `${stockAdjustment.adjustment.item.productId}-${stockAdjustment.adjustment.mode}`
            : 'closed'
        }
        open={stockAdjustment.adjustment !== null}
        item={stockAdjustment.adjustment?.item ?? null}
        mode={stockAdjustment.adjustment?.mode ?? 'add'}
        minimumStock={
          stockAdjustment.adjustment
            ? productsById.get(stockAdjustment.adjustment.item.productId)
                ?.minimumStock
            : undefined
        }
        loading={stockAdjustment.isPending}
        serverError={stockAdjustment.serverError}
        onClearError={stockAdjustment.clearError}
        onCancel={stockAdjustment.closeAdjustment}
        onConfirm={stockAdjustment.confirmAdjustment}
      />
    </div>
  );
}
