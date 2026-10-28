import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, Search, Truck, X } from 'lucide-react';
import { supplierApi } from '@/api/suppliers';
import type { Supplier } from '@/types/supplier';
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
import {
  SupplierCard,
  SupplierCardSkeleton,
} from '@/components/suppliers/SupplierCard';

const PAGE_SIZE = 20;

export default function SupplierList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Supplier | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['suppliers', page, PAGE_SIZE],
    queryFn: () => supplierApi.list(page, PAGE_SIZE),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      supplierApi.remove(id).then(() => name),
    onSuccess: (name) => {
      toast.success('Supplier deleted', `"${name}" was removed.`);
      // If we just removed the last card on a non-first page, step back a page.
      if (data && data.content.length === 1 && page > 0) {
        setPage((current) => Math.max(0, current - 1));
      }
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setPendingDelete(null);
    },
    onError: (mutationError) => {
      toast.error(
        "Couldn't delete supplier",
        getApiErrorMessage(mutationError, 'Failed to delete supplier.')
      );
      setPendingDelete(null);
    },
  });

  const suppliers = data?.content ?? [];
  const query = search.trim().toLowerCase();
  const filtered = query
    ? suppliers.filter(
        (supplier) =>
          supplier.supplierName.toLowerCase().includes(query) ||
          supplier.supplierEmail.toLowerCase().includes(query) ||
          supplier.mobileNo.toLowerCase().includes(query) ||
          supplier.gstNo.toLowerCase().includes(query)
      )
    : suppliers;

  const countLabel = data
    ? query
      ? `${filtered.length} of ${suppliers.length} on this page`
      : `${data.totalElements} supplier${data.totalElements === 1 ? '' : 's'}`
    : '—';

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Suppliers' }]}
        icon={<Truck className="h-4 w-4" />}
        className="border-indigo-100/80 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 shadow-sm shadow-indigo-100/40"
        action={
          <>
            {data && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100">
                {data.totalElements} supplier{data.totalElements === 1 ? '' : 's'}
              </span>
            )}
            <Button
              onClick={() => navigate('/suppliers/create')}
              className="gap-2 shadow-sm shadow-indigo-200"
            >
              <Plus className="h-4 w-4" />
              New Supplier
            </Button>
          </>
        }
      />

      <Card className="relative overflow-hidden border-indigo-100/80 bg-gradient-to-r from-indigo-50/80 via-white to-emerald-50/60 p-4 shadow-sm shadow-indigo-100/40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-indigo-200/20 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 left-1/3 h-24 w-24 rounded-full bg-emerald-200/20 blur-2xl"
        />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-3 sm:max-w-md">
            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200 sm:flex">
              <Truck className="h-4 w-4" />
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search this page by name, email, phone, or GST"
                aria-label="Search suppliers"
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
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200/80">
              {countLabel}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SupplierCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <Alert tone="error">
          {getApiErrorMessage(error, 'Failed to load suppliers.')}
        </Alert>
      ) : filtered.length === 0 ? (
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/40">
          <EmptyState
            title={suppliers.length === 0 ? 'No suppliers yet' : 'No matching suppliers'}
            description={
              suppliers.length === 0
                ? 'Add your first supplier to start creating purchase orders.'
                : 'No supplier on this page matches your search.'
            }
            icon={<Truck className="h-5 w-5" />}
            action={
              suppliers.length === 0 ? (
                <Button onClick={() => navigate('/suppliers/create')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Supplier
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((supplier) => (
            <SupplierCard
              key={supplier.supplierId}
              supplier={supplier}
              onView={() => navigate(`/suppliers/${supplier.supplierId}`)}
              onEdit={() => navigate(`/suppliers/${supplier.supplierId}/edit`)}
              onDelete={() => setPendingDelete(supplier)}
            />
          ))}
        </div>
      )}

      {data && data.totalElements > 0 && !isLoading && !isError && (
        <Card className="overflow-hidden border-indigo-100/70 bg-gradient-to-r from-white via-slate-50/60 to-indigo-50/40 shadow-sm shadow-indigo-100/30">
          <Pagination
            page={data.number}
            size={data.size}
            totalElements={data.totalElements}
            totalPages={data.totalPages}
            onPageChange={setPage}
            disabled={deleteMutation.isPending}
          />
        </Card>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete supplier"
        message={
          pendingDelete ? (
            <>
              Are you sure you want to delete{' '}
              <strong className="font-semibold text-slate-900">
                {pendingDelete.supplierName}
              </strong>
              ? This action cannot be undone.
            </>
          ) : (
            ''
          )
        }
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteMutation.mutate({
              id: pendingDelete.supplierId,
              name: pendingDelete.supplierName,
            });
          }
        }}
      />
    </div>
  );
}
