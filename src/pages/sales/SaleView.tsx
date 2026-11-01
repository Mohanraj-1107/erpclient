import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ClipboardList,
  Hash,
  Mail,
  Phone,
  Truck,
  Trash2,
} from 'lucide-react';
import { saleApi } from '@/api/sales';
import type { SaleStatus } from '@/types/sales';
import {
  formatSaleRef,
  getLineTotals,
  getSaleTotals,
} from '@/types/sales';
import {
  formatDateTime,
  formatDate,
  formatMoney,
  formatQuantity,
  getApiErrorMessage,
} from '@/lib/utils';
import { getInitials, getProductColor } from '@/lib/productVisuals';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/common/Alert';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useToast } from '@/components/common/useToast';
import { useProductLookup } from '@/hooks/useProductLookup';
import { useCustomerLookup } from '@/hooks/useCustomerLookup';
import { SaleStatusBadge } from '@/components/sales/SaleStatusBadge';

const DRAFT: SaleStatus = 'DRAFT';

type ConfirmAction = 'complete' | 'cancel' | 'delete';

const CONFIRM_COPY: Record<
  ConfirmAction,
  { title: string; confirmLabel: string }
> = {
  complete: { title: 'Complete sale', confirmLabel: 'Complete' },
  cancel: { title: 'Cancel sale', confirmLabel: 'Cancel order' },
  delete: { title: 'Delete sale', confirmLabel: 'Delete' },
};

function RecordRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-700">{value}</span>
    </div>
  );
}

function TotalsRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <tr className={emphasize ? 'border-t border-slate-200' : undefined}>
      <td
        colSpan={5}
        className={
          emphasize
            ? 'px-4 py-2.5 text-right text-xs font-semibold text-slate-700'
            : 'px-4 py-1.5 text-right text-xs text-slate-400'
        }
      >
        {label}
      </td>
      <td
        className={
          emphasize
            ? 'px-4 py-2.5 text-right text-sm font-semibold text-slate-900 tabular-nums'
            : 'px-4 py-1.5 text-right text-xs font-medium text-slate-700 tabular-nums'
        }
      >
        {value}
      </td>
    </tr>
  );
}

function ViewSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="space-y-4 p-5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="space-y-3 p-5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </Card>
          <Card className="space-y-3 p-5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SaleView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const toast = useToast();
  const saleId = Number(id);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const { productsById } = useProductLookup();
  const { customersById } = useCustomerLookup();

  const {
    data: sale,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['sale', saleId],
    queryFn: () => saleApi.get(saleId),
    enabled: Number.isFinite(saleId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ action }: { action: 'complete' | 'cancel' }) =>
      action === 'complete'
        ? saleApi.confirm(saleId)
        : saleApi.cancel(saleId),
    onSuccess: (_, { action }) => {
      toast.success(
        action === 'complete' ? 'Sale completed' : 'Sale cancelled',
        action === 'complete'
          ? 'Stock has been removed from inventory.'
          : 'The order will stay in your records.'
      );
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (mutationError, { action }) => {
      toast.error(
        action === 'complete'
          ? "Couldn't complete sale"
          : "Couldn't cancel sale",
        getApiErrorMessage(mutationError, `Failed to ${action} sale.`)
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => saleApi.remove(saleId),
    onSuccess: () => {
      toast.success('Sale deleted', 'The draft sale was removed.');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      navigate('/sales');
    },
    onError: (mutationError) => {
      toast.error(
        "Couldn't delete sale",
        getApiErrorMessage(mutationError, 'Failed to delete sale.')
      );
    },
  });

  if (!Number.isFinite(saleId)) {
    return <Alert tone="error">Invalid sale id.</Alert>;
  }

  const customer = sale
    ? customersById.get(sale.customerId)
    : undefined;
  const customerName =
    sale?.customerName ?? customer?.customerName ?? undefined;
  const customerEmail = customer?.customerEmail;
  const customerPhone = customer?.mobileNo;
  const customerColor = getProductColor(sale?.customerId ?? 0);
  const isDraft = sale?.status === DRAFT;
  const totals = getSaleTotals(sale?.items);
  const itemCount = sale?.items?.length ?? 0;
  const busy = statusMutation.isPending || deleteMutation.isPending;

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'Sales', to: '/sales' },
          { label: sale ? formatSaleRef(saleId) : 'Sale' },
        ]}
        icon={<ClipboardList className="h-4 w-4" />}
        className="border-slate-200/80 bg-slate-200/70 shadow-xs backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
        action={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/sales')}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            {isDraft && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmAction('cancel')}
                  disabled={busy}
                  className="gap-1.5"
                >
                  <Ban className="h-3.5 w-3.5" />
                  Cancel order
                </Button>
                <Button
                  size="sm"
                  onClick={() => setConfirmAction('complete')}
                  disabled={busy}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Complete
                </Button>
              </>
            )}
          </>
        }
      />

      {isLoading ? (
        <ViewSkeleton />
      ) : isError ? (
        <Alert tone="error">
          {getApiErrorMessage(error, 'Failed to load sale.')}
        </Alert>
      ) : sale ? (
        <div className="space-y-4">
          <Card className="overflow-hidden border-slate-200/80">
            <div
              className="h-1.5 w-full"
              style={{
                background: `linear-gradient(90deg, ${customerColor}, ${customerColor}55)`,
              }}
            />
            <div
              className="relative overflow-hidden p-5"
              style={{
                background: `linear-gradient(135deg, ${customerColor}10 0%, rgba(255,255,255,0) 62%)`,
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full"
                style={{ backgroundColor: `${customerColor}12` }}
              />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold shadow-sm ring-2 ring-white"
                    style={{
                      color: customerColor,
                      borderColor: customerColor,
                      backgroundColor: `${customerColor}1a`,
                    }}
                  >
                    {getInitials(
                      customerName ?? `Customer #${sale.customerId}`
                    )}
                  </div>

                  <div className="min-w-0 flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-semibold text-slate-900">
                        {customerName ?? `Customer #${sale.customerId}`}
                      </h2>
                      <SaleStatusBadge status={sale.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 font-medium">
                        {formatSaleRef(sale.saleId)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 font-medium">
                        Raised {formatDate(sale.createdOn)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 font-medium">
                        {itemCount} line{itemCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Card>
                <CardHeader className="flex-row items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle>Line items</CardTitle>
                    <CardDescription>
                      Products on this sale order.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {itemCount === 0 ? (
                    <p className="m-5 rounded-lg border border-dashed border-slate-200 bg-slate-50/40 px-4 py-6 text-center text-xs text-slate-400">
                      No items on this order.
                    </p>
                  ) : (
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="pl-4">Product</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">
                            Unit price
                          </TableHead>
                          <TableHead className="text-right">Disc.</TableHead>
                          <TableHead className="text-right">Tax</TableHead>
                          <TableHead className="pr-4 text-right">
                            Line total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sale.items.map((item, index) => {
                          const product = productsById.get(item.productId);
                          const line = getLineTotals(item);
                          return (
                            <TableRow key={item.itemId ?? index}>
                              <TableCell className="pl-4">
                                <p className="text-sm font-medium text-slate-900">
                                  {item.productName ??
                                    product?.productName ??
                                    `Product #${item.productId}`}
                                </p>
                                {product && (
                                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                    {product.productCode}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-xs text-slate-600 tabular-nums">
                                {formatQuantity(item.quantity)}
                                {product && (
                                  <span className="ml-1 text-slate-400">
                                    {product.unit}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-xs text-slate-600 tabular-nums">
                                {formatMoney(item.unitPrice)}
                              </TableCell>
                              <TableCell className="text-right text-xs text-slate-500 tabular-nums">
                                {formatQuantity(item.discountRate)}%
                              </TableCell>
                              <TableCell className="text-right text-xs text-slate-500 tabular-nums">
                                {formatQuantity(item.taxRate)}%
                              </TableCell>
                              <TableCell className="pr-4 text-right text-sm font-medium text-slate-800 tabular-nums">
                                {formatMoney(line.total)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      <tfoot className="border-t border-slate-200 bg-slate-50/40">
                        <tr>
                          <td colSpan={6} className="pt-2.5" />
                        </tr>
                        <TotalsRow
                          label="Subtotal"
                          value={formatMoney(totals.gross)}
                        />
                        <TotalsRow
                          label="Discount"
                          value={`−${formatMoney(totals.discount)}`}
                        />
                        <TotalsRow
                          label="Tax"
                          value={`+${formatMoney(totals.tax)}`}
                        />
                        <TotalsRow
                          label="Grand total"
                          value={formatMoney(totals.total)}
                          emphasize
                        />
                      </tfoot>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="flex-row items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle>Customer</CardTitle>
                    <CardDescription>Customer on this order.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <p className="text-sm font-medium text-slate-900">
                    {customerName ?? `Customer #${sale.customerId}`}
                  </p>
                  {customerEmail?.trim() && (
                    <p className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-theme-text-muted" />
                      <span className="truncate">{customerEmail}</span>
                    </p>
                  )}
                  {customerPhone?.trim() && (
                    <p className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-theme-text-muted" />
                      {customerPhone}
                    </p>
                  )}
                  {customer?.gstNo?.trim() && (
                    <p className="flex items-center gap-2 text-xs text-slate-600">
                      <Hash className="h-3.5 w-3.5 shrink-0 text-theme-text-muted" />
                      <span className="font-mono text-[11px] uppercase tracking-wide">
                        {customer.gstNo}
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 ring-1 ring-amber-200">
                    <Hash className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle>Record details</CardTitle>
                    <CardDescription>Order bookkeeping.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <RecordRow
                    label="Order number"
                    value={formatSaleRef(sale.saleId)}
                  />
                  <RecordRow
                    label="Created"
                    value={formatDateTime(sale.createdOn)}
                  />
                  <RecordRow
                    label="Last updated"
                    value={formatDateTime(sale.modifiedOn)}
                  />
                </CardContent>
              </Card>

              {isDraft ? (
                <Card className="overflow-hidden border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-emerald-50/60 p-5 shadow-sm shadow-indigo-100/40">
                  <div className="flex items-center gap-2 text-xs font-medium text-indigo-700">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200">
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                    Delete draft sale
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => setConfirmAction('delete')}
                    className="mt-3 w-full gap-1.5 shadow-sm shadow-indigo-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete draft sale
                  </Button>
                </Card>
              ) : (
                <Card className="border-theme-border p-5 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-medium text-theme-text">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border">
                      {sale.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Ban className="h-3.5 w-3.5" />
                      )}
                    </span>
                    {sale.status === 'COMPLETED'
                      ? 'Completed — stock removed from inventory.'
                      : 'Cancelled — no stock was removed.'}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmAction ? CONFIRM_COPY[confirmAction].title : ''}
        confirmLabel={
          confirmAction ? CONFIRM_COPY[confirmAction].confirmLabel : undefined
        }
        loading={statusMutation.isPending || deleteMutation.isPending}
        message={
          confirmAction && sale ? (
            (() => {
              const name = customerName ?? `customer #${sale.customerId}`;
              const strong = (
                <strong className="font-semibold text-slate-900">{name}</strong>
              );
              switch (confirmAction) {
                case 'complete':
                  return (
                    <>
                      Mark the sale for {strong} as completed? Stock will be
                      removed from inventory.
                    </>
                  );
                case 'cancel':
                  return (
                    <>
                      Cancel the sale for {strong}? The order will stay in
                      your records.
                    </>
                  );
                case 'delete':
                  return (
                    <>
                      Are you sure you want to delete the sale for{' '}
                      {strong}? This action cannot be undone.
                    </>
                  );
              }
            })()
          ) : (
            ''
          )
        }
        onCancel={() => {
          if (!statusMutation.isPending && !deleteMutation.isPending) {
            setConfirmAction(null);
          }
        }}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction === 'delete') {
            deleteMutation.mutate();
          } else {
            statusMutation.mutate({ action: confirmAction });
          }
          setConfirmAction(null);
        }}
      />
    </div>
  );
}
