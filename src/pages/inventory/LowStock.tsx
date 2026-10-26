import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react';
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
import {
  InventoryTable,
  InventoryTableSkeleton,
} from '@/components/inventory/InventoryTable';
import { StockAdjustDialog } from '@/components/inventory/StockAdjustDialog';

export default function LowStock() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const stockAdjustment = useStockAdjustment();
  const { productsById } = useProductLookup();

  const lowStockQuery = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.lowStock,
  });

  const items = lowStockQuery.data ?? [];
  const lowStockIds = new Set(items.map((item) => item.productId));

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

  const countLabel = lowStockQuery.data
    ? query
      ? `${filtered.length} of ${items.length} items`
      : `${items.length} item${items.length === 1 ? '' : 's'}`
    : '—';

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Inventory', to: '/inventory' },
          { label: 'Low stock' },
        ]}
        icon={<TriangleAlert className="h-4 w-4" />}
        action={
          <>
            {lowStockQuery.data && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                {items.length} low
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/inventory')}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All stock
            </Button>
          </>
        }
      />

      {!lowStockQuery.isLoading &&
        !lowStockQuery.isError &&
        items.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 ring-1 ring-amber-200">
              <TriangleAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Low stock alert
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
                {items.length} item{items.length === 1 ? '' : 's'} at or below
                minimum stock. Add stock to avoid stockouts.
              </p>
            </div>
          </div>
        )}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search low-stock items"
              aria-label="Search low-stock items"
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
              onClick={() => lowStockQuery.refetch()}
              disabled={lowStockQuery.isFetching}
              className="gap-1.5"
            >
              <RefreshCw
                className={cn(
                  'h-3.5 w-3.5',
                  lowStockQuery.isFetching && 'animate-spin'
                )}
              />
              Refresh
            </Button>
          </div>
        </div>

        {lowStockQuery.isLoading ? (
          <InventoryTableSkeleton />
        ) : lowStockQuery.isError ? (
          <div className="p-4">
            <Alert tone="error">
              {getApiErrorMessage(
                lowStockQuery.error,
                'Failed to load low-stock items.'
              )}
            </Alert>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={items.length === 0 ? 'All stock levels are healthy' : 'No matching items'}
            description={
              items.length === 0
                ? 'No products are at or below their minimum stock right now.'
                : 'No low-stock item matches your search.'
            }
            icon={<CheckCircle2 className="h-5 w-5" />}
            action={
              items.length === 0 ? (
                <Button variant="outline" onClick={() => navigate('/inventory')}>
                  Back to inventory
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
            showDeficit
            onAdjust={stockAdjustment.openAdjustment}
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
