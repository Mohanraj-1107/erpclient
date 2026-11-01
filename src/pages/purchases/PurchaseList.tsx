import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, Search, ShoppingCart, X } from 'lucide-react';
import { purchaseApi } from '@/api/purchases';
import type { Purchase, PurchaseStatus } from '@/types/purchase';
import { getPurchaseTotals } from '@/types/purchase';
import { cn, getApiErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/common/Alert';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useToast } from '@/components/common/useToast';
import { useSupplierLookup } from '@/hooks/useSupplierLookup';
import { PurchaseSummary } from '@/components/purchases/PurchaseSummary';
import { OrderFilterTabs } from '@/components/orders/OrderFilterTabs';
import {
  PurchaseTable,
  PurchaseTableSkeleton,
} from '@/components/purchases/PurchaseTable';

const PAGE_SIZE = 20;

type StatusFilter = 'ALL' | PurchaseStatus;

type PendingActionType = 'complete' | 'cancel' | 'delete';

interface PendingAction {
  type: PendingActionType;
  purchase: Purchase;
}

const ACTION_COPY: Record<
  PendingActionType,
  { title: string; verb: string; confirmLabel: string }
> = {
  complete: {
    title: 'Complete purchase',
    verb: 'complete',
    confirmLabel: 'Complete',
  },
  cancel: {
    title: 'Cancel purchase',
    verb: 'cancel',
    confirmLabel: 'Cancel order',
  },
  delete: {
    title: 'Delete purchase',
    verb: 'delete',
    confirmLabel: 'Delete',
  },
};

export default function PurchaseList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { suppliersById } = useSupplierLookup();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['purchases', page, PAGE_SIZE],
    queryFn: () => purchaseApi.list(page, PAGE_SIZE),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ type, purchase }: PendingAction) => {
      if (type === 'complete') {
        await purchaseApi.complete(purchase.purchaseId);
      } else if (type === 'cancel') {
        await purchaseApi.cancel(purchase.purchaseId);
      } else {
        await purchaseApi.remove(purchase.purchaseId);
      }
    },
    onSuccess: (_, { type, purchase }) => {
      const supplierName = resolveSupplierName(purchase);
      const labels: Record<
        PendingActionType,
        { title: string; message: string }
      > = {
        complete: {
          title: 'Purchase completed',
          message: `Purchase for ${supplierName} marked completed — stock added to inventory.`,
        },
        cancel: {
          title: 'Purchase cancelled',
          message: `Purchase for ${supplierName} was cancelled.`,
        },
        delete: {
          title: 'Purchase deleted',
          message: `Purchase for ${supplierName} was removed.`,
        },
      };
      toast.success(labels[type].title, labels[type].message);
      if (type === 'delete' && data && data.content.length === 1 && page > 0) {
        setPage((current) => Math.max(0, current - 1));
      }
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setPendingAction(null);
    },
    onError: (mutationError, { type }) => {
      toast.error(
        `Couldn't ${ACTION_COPY[type].verb} purchase`,
        getApiErrorMessage(
          mutationError,
          `Failed to ${ACTION_COPY[type].verb} purchase.`
        )
      );
      setPendingAction(null);
    },
  });

  const resolveSupplierName = (purchase: Purchase): string =>
    purchase.supplierName ??
    suppliersById.get(purchase.supplierId)?.supplierName ??
    `Supplier #${purchase.supplierId}`;

  const purchases = data?.content ?? [];
  const query = search.trim().toLowerCase();
  const matchesSearch = (purchase: Purchase) =>
    !query ||
    resolveSupplierName(purchase).toLowerCase().includes(query) ||
    String(purchase.purchaseId).includes(query);

  const searched = purchases.filter(matchesSearch);
  const filtered = searched.filter(
    (purchase) => statusFilter === 'ALL' || purchase.status === statusFilter
  );

  const countFor = (status: StatusFilter) =>
    status === 'ALL'
      ? searched.length
      : searched.filter((purchase) => purchase.status === status).length;

  const stats = {
    totalOrders: data?.totalElements ?? '—',
    draftCount: purchases.filter((purchase) => purchase.status === 'DRAFT')
      .length,
    completedCount: purchases.filter(
      (purchase) => purchase.status === 'COMPLETED'
    ).length,
    pageValue: purchases.reduce(
      (sum, purchase) => sum + getPurchaseTotals(purchase.items).total,
      0
    ),
  };

  const countLabel = data
    ? `${data.totalElements} purchase${data.totalElements === 1 ? '' : 's'}`
    : '—';

  const pending = pendingAction;
  const copy = pending ? ACTION_COPY[pending.type] : undefined;

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Purchases' }]}
        icon={<ShoppingCart className="h-4 w-4" />}
        className="border-slate-200/80 bg-slate-200/70 shadow-xs backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
        action={
          <>
            {data && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100">
                {countLabel}
              </span>
            )}
            <Button
              onClick={() => navigate('/purchases/create')}
              className="gap-2 shadow-sm shadow-indigo-200"
            >
              <Plus className="h-4 w-4" />
              New Purchase
            </Button>
          </>
        }
      />

      <PurchaseSummary stats={stats} loading={isLoading} />

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200/80">
          <OrderFilterTabs
            ariaLabel="Filter purchases by status"
            value={statusFilter}
            onChange={setStatusFilter}
            tabs={[
              { value: 'ALL', label: 'All', count: countFor('ALL') },
              { value: 'DRAFT', label: 'Draft', count: countFor('DRAFT') },
              {
                value: 'COMPLETED',
                label: 'Completed',
                count: countFor('COMPLETED'),
              },
              {
                value: 'CANCELLED',
                label: 'Cancelled',
                count: countFor('CANCELLED'),
              },
            ]}
          />
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by supplier or purchase Id"
              aria-label="Search purchases"
              className="pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border-0 p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-0 focus:ring-offset-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              <span className="font-medium text-slate-700 tabular-nums">
                {filtered.length}
              </span>{' '}
              shown
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5"
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')}
              />
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <PurchaseTableSkeleton />
        ) : isError ? (
          <div className="p-4">
            <Alert tone="error">
              {getApiErrorMessage(error, 'Failed to load purchases.')}
            </Alert>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              purchases.length === 0
                ? 'No purchases yet'
                : 'No matching purchases'
            }
            description={
              purchases.length === 0
                ? 'Create your first purchase order to start restocking inventory.'
                : 'Try a different status tab or clear the search.'
            }
            icon={<ShoppingCart className="h-5 w-5" />}
            action={
              purchases.length === 0 ? (
                <Button
                  onClick={() => navigate('/purchases/create')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Purchase
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('ALL');
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <div key={statusFilter} className="animate-fade-in">
            <PurchaseTable
              purchases={filtered}
              supplierNameFor={resolveSupplierName}
              onView={(purchase) => navigate(`/purchases/${purchase.purchaseId}`)}
              onComplete={(purchase) =>
                setPendingAction({ type: 'complete', purchase })
              }
              onCancel={(purchase) =>
                setPendingAction({ type: 'cancel', purchase })
              }
              onDelete={(purchase) =>
                setPendingAction({ type: 'delete', purchase })
              }
            />
          </div>
        )}

        {data && data.totalElements > 0 && !isLoading && !isError && (
          <Pagination
            page={data.number}
            size={data.size}
            totalElements={data.totalElements}
            totalPages={data.totalPages}
            onPageChange={setPage}
            disabled={actionMutation.isPending}
          />
        )}
      </Card>

      <ConfirmDialog
        open={pending !== null}
        title={copy?.title ?? ''}
        message={
          pending && copy ? (
            pending.type === 'complete' ? (
              <>
                Mark the purchase for{' '}
                <strong className="font-semibold text-slate-900">
                  {resolveSupplierName(pending.purchase)}
                </strong>{' '}
                as completed? Stock will be added to inventory.
              </>
            ) : pending.type === 'cancel' ? (
              <>
                Cancel the purchase for{' '}
                <strong className="font-semibold text-slate-900">
                  {resolveSupplierName(pending.purchase)}
                </strong>
                ? The order will stay in your records.
              </>
            ) : (
              <>
                Are you sure you want to{' '}
                <strong className="font-semibold text-slate-900">delete</strong>{' '}
                the purchase for{' '}
                <strong className="font-semibold text-slate-900">
                  {resolveSupplierName(pending.purchase)}
                </strong>
                ? This action cannot be undone.
              </>
            )
          ) : (
            ''
          )
        }
        confirmLabel={copy?.confirmLabel}
        loading={actionMutation.isPending}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          if (pending) {
            actionMutation.mutate(pending);
          }
        }}
      />
    </div>
  );
}
