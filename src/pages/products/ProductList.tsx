import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { productApi } from '@/api/products';
import type { Product } from '@/types/product';
import { cn, formatMoney, getApiErrorMessage } from '@/lib/utils';
import { getInitials, getProductColor } from '@/lib/productVisuals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Alert } from '@/components/common/Alert';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useToast } from '@/components/common/useToast';

const PAGE_SIZE = 20;

function getMargin(product: Product): number | null {
  if (product.purchasePrice <= 0) return null;
  return ((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100;
}

function MarginBadge({ product }: { product: Product }) {
  const margin = getMargin(product);
  if (margin === null) {
    return <span className="text-xs text-slate-300">—</span>;
  }
  const positive = margin >= 0;
  return (
    <Badge variant={positive ? 'success' : 'danger'} className="font-normal">
      {positive ? '+' : ''}
      {margin.toFixed(1)}%
    </Badge>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="hidden h-5 w-14 rounded-md sm:block" />
          <Skeleton className="hidden h-3 w-16 sm:block" />
          <Skeleton className="hidden h-3 w-16 sm:block" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function ProductList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['products', page, PAGE_SIZE],
    queryFn: () => productApi.list(page, PAGE_SIZE),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      productApi.remove(id).then(() => name),
    onSuccess: (name) => {
      toast.success('Product deleted', `"${name}" was removed from your catalog.`);
      // If we just removed the last row on a non-first page, step back a page.
      if (data && data.content.length === 1 && page > 0) {
        setPage((current) => Math.max(0, current - 1));
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setPendingDelete(null);
    },
    onError: (mutationError) => {
      toast.error(
        "Couldn't delete product",
        getApiErrorMessage(mutationError, 'Failed to delete product.')
      );
      setPendingDelete(null);
    },
  });

  const products = data?.content ?? [];
  const query = search.trim().toLowerCase();
  const filtered = query
    ? products.filter(
        (product) =>
          product.productCode.toLowerCase().includes(query) ||
          product.productName.toLowerCase().includes(query)
      )
    : products;

  const countLabel = data
    ? query
      ? `${filtered.length} of ${products.length} on this page`
      : `${data.totalElements} product${data.totalElements === 1 ? '' : 's'}`
    : '—';

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Page header */}
      <Breadcrumb
        items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Products' }]}
        icon={<Box className="h-4 w-4" />}
        action={
          <>
            {data && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100">
                {data.totalElements} product{data.totalElements === 1 ? '' : 's'}
              </span>
            )}
            <Button
              onClick={() => navigate('/products/create')}
              className="gap-2 shadow-sm shadow-indigo-200"
            >
              <Plus className="h-4 w-4" />
              New Product
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search this page by code or name"
              aria-label="Search products"
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
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="p-4">
            <Alert tone="error">
              {getApiErrorMessage(error, 'Failed to load products.')}
            </Alert>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={products.length === 0 ? 'No products yet' : 'No matching products'}
            description={
              products.length === 0
                ? 'Create your first product to start managing inventory.'
                : 'No product on this page matches your search.'
            }
            icon={<Box className="h-5 w-5" />}
            action={
              products.length === 0 ? (
                <Button onClick={() => navigate('/products/create')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Product
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              )
            }
          />
        ) : (
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Purchase</TableHead>
                <TableHead className="text-right">Selling</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Min Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product, index) => (
                <TableRow key={product.productId} className="hover:bg-indigo-50/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold"
                        style={{
                          color: getProductColor(index),
                          borderColor: getProductColor(index),
                          backgroundColor: `${getProductColor(index)}1a`,
                        }}
                      >
                        {getInitials(product.productName)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-normal text-slate-900">
                          {product.productName}
                        </p>
                        <p className="font-mono text-[11px] text-slate-400">
                          {product.productCode}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info" className="font-normal">{product.unit}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">
                    {formatMoney(product.purchasePrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums text-slate-900">
                    {formatMoney(product.sellingPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <MarginBadge product={product} />
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums text-slate-500">
                    {product.taxRate}%
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums text-slate-500">
                    {product.minimumStock} {product.unit.toLowerCase()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/products/${product.productId}/edit`)}
                        className="px-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                        aria-label={`Edit ${product.productName}`}
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDelete(product)}
                        className="px-2 text-status-error-fg hover:bg-status-error hover:text-status-error-fg"
                        aria-label={`Delete ${product.productName}`}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {data && !isLoading && !isError && (
          <Pagination
            page={data.number}
            size={data.size}
            totalElements={data.totalElements}
            totalPages={data.totalPages}
            onPageChange={setPage}
            disabled={deleteMutation.isPending}
          />
        )}
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete product"
        message={
          pendingDelete ? (
            <>
              Are you sure you want to delete{' '}
              <strong className="font-semibold text-slate-900">
                {pendingDelete.productName}
              </strong>
              ? This will also remove its inventory record. This action cannot be
              undone.
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
              id: pendingDelete.productId,
              name: pendingDelete.productName,
            });
          }
        }}
      />
    </div>
  );
}
