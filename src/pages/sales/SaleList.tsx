import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, Search, ShoppingCart, X } from 'lucide-react';
import { saleApi } from '@/api/sales';
import type { Sale, SaleStatus } from '@/types/sales';
import { getSaleTotals } from '@/types/sales';
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
import { useCustomerLookup } from '@/hooks/useCustomerLookup';
import { SaleSummary } from '@/components/sales/SaleSummary';
import { OrderFilterTabs } from '@/components/orders/OrderFilterTabs';
import { SaleTable, SaleTableSkeleton } from '@/components/sales/SaleTable';

const PAGE_SIZE = 20;

type StatusFilter = 'ALL' | SaleStatus;

type PendingActionType = 'complete' | 'cancel' | 'delete';

interface PendingAction {
  type: PendingActionType;
  sale: Sale;
}

const ACTION_COPY: Record<
  PendingActionType,
  { title: string; verb: string; confirmLabel: string }
> = {
  complete: {
    title: 'Complete sale',
    verb: 'complete',
    confirmLabel: 'Complete',
  },
  cancel: {
    title: 'Cancel sale',
    verb: 'cancel',
    confirmLabel: 'Cancel order',
  },
  delete: {
    title: 'Delete sale',
    verb: 'delete',
    confirmLabel: 'Delete',
  },
};

export default function SaleList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { customersById } = useCustomerLookup();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['sales', page, PAGE_SIZE],
    queryFn: () => saleApi.list(page, PAGE_SIZE),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ type, sale }: PendingAction) => {
      if (type === 'complete') {
        await saleApi.confirm(sale.saleId);
      } else if (type === 'cancel') {
        await saleApi.cancel(sale.saleId);
      } else {
        await saleApi.remove(sale.saleId);
      }
    },
    onSuccess: (_, { type, sale }) => {
      const customerName = resolveCustomerName(sale);
      const labels: Record<
        PendingActionType,
        { title: string; message: string }
      > = {
        complete: {
          title: 'Sale completed',
          message: `Sale for ${customerName} marked completed — stock removed from inventory.`,
        },
        cancel: {
          title: 'Sale cancelled',
          message: `Sale for ${customerName} was cancelled.`,
        },
        delete: {
          title: 'Sale deleted',
          message: `Sale for ${customerName} was removed.`,
        },
      };
      toast.success(labels[type].title, labels[type].message);
      if (type === 'delete' && data && data.content.length === 1 && page > 0) {
        setPage((current) => Math.max(0, current - 1));
      }
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setPendingAction(null);
    },
    onError: (mutationError, { type }) => {
      toast.error(
        `Couldn't ${ACTION_COPY[type].verb} sale`,
        getApiErrorMessage(
          mutationError,
          `Failed to ${ACTION_COPY[type].verb} sale.`
        )
      );
      setPendingAction(null);
    },
  });

  const resolveCustomerName = (sale: Sale): string =>
    sale.customerName ??
    customersById.get(sale.customerId)?.customerName ??
    `Customer #${sale.customerId}`;

  const sales = data?.content ?? [];
  const query = search.trim().toLowerCase();
  const matchesSearch = (sale: Sale) =>
    !query ||
    resolveCustomerName(sale).toLowerCase().includes(query) ||
    String(sale.saleId).includes(query);

  const searched = sales.filter(matchesSearch);
  const filtered = searched.filter(
    (sale) => statusFilter === 'ALL' || sale.status === statusFilter
  );

  const countFor = (status: StatusFilter) =>
    status === 'ALL'
      ? searched.length
      : searched.filter((sale) => sale.status === status).length;

  const stats = {
    totalOrders: data?.totalElements ?? '—',
    draftCount: sales.filter((sale) => sale.status === 'DRAFT').length,
    completedCount: sales.filter(
      (sale) => sale.status === 'COMPLETED'
    ).length,
    pageValue: sales.reduce(
      (sum, sale) => sum + getSaleTotals(sale.items).total,
      0
    ),
  };

  const countLabel = data
    ? `${data.totalElements} sale${data.totalElements === 1 ? '' : 's'}`
    : '—';

  const pending = pendingAction;
  const copy = pending ? ACTION_COPY[pending.type] : undefined;

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Sales' }]}
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
              onClick={() => navigate('/sales/create')}
              className="gap-2 shadow-sm shadow-indigo-200"
            >
              <Plus className="h-4 w-4" />
              New Sale
            </Button>
          </>
        }
      />

      <SaleSummary stats={stats} loading={isLoading} />

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200/80">
          <OrderFilterTabs
            ariaLabel="Filter sales by status"
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
              placeholder="Search by customer or sale Id"
              aria-label="Search sales"
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
          <SaleTableSkeleton />
        ) : isError ? (
          <div className="p-4">
            <Alert tone="error">
              {getApiErrorMessage(error, 'Failed to load sales.')}
            </Alert>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              sales.length === 0
                ? 'No sales yet'
                : 'No matching sales'
            }
            description={
              sales.length === 0
                ? 'Create your first sale order to start selling products.'
                : 'Try a different status tab or clear the search.'
            }
            icon={<ShoppingCart className="h-5 w-5" />}
            action={
              sales.length === 0 ? (
                <Button
                  onClick={() => navigate('/sales/create')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Sale
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
            <SaleTable
              sales={filtered}
              customerNameFor={resolveCustomerName}
              onView={(sale) => navigate(`/sales/${sale.saleId}`)}
              onComplete={(sale) =>
                setPendingAction({ type: 'complete', sale })
              }
              onCancel={(sale) =>
                setPendingAction({ type: 'cancel', sale })
              }
              onDelete={(sale) =>
                setPendingAction({ type: 'delete', sale })
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
                Mark the sale for{' '}
                <strong className="font-semibold text-slate-900">
                  {resolveCustomerName(pending.sale)}
                </strong>{' '}
                as completed? Stock will be removed from inventory.
              </>
            ) : pending.type === 'cancel' ? (
              <>
                Cancel the sale for{' '}
                <strong className="font-semibold text-slate-900">
                  {resolveCustomerName(pending.sale)}
                </strong>
                ? The order will stay in your records.
              </>
            ) : (
              <>
                Are you sure you want to{' '}
                <strong className="font-semibold text-slate-900">delete</strong>{' '}
                the sale for{' '}
                <strong className="font-semibold text-slate-900">
                  {resolveCustomerName(pending.sale)}
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
