import type { MouseEventHandler, ReactNode } from 'react';
import { Ban, CheckCircle2, Eye, Trash2 } from 'lucide-react';
import type { Sale } from '@/types/sales';
import { formatSaleRef, getSaleTotals } from '@/types/sales';
import { cn, formatDate, formatMoney, formatQuantity } from '@/lib/utils';
import { getInitials, getProductColor } from '@/lib/productVisuals';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { SaleStatusBadge } from './SaleStatusBadge';

interface SaleTableProps {
  sales: Sale[];
  customerNameFor: (sale: Sale) => string;
  onView: (sale: Sale) => void;
  onComplete: (sale: Sale) => void;
  onCancel: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
}

function RowActionButton({
  icon,
  label,
  tone,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  tone?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-md border-0 p-0 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-0 focus:ring-offset-0',
        tone
      )}
    >
      {icon}
    </button>
  );
}

function HeaderRow() {
  return (
    <TableRow className="hover:bg-transparent">
      <TableHead>Order</TableHead>
      <TableHead>Customer</TableHead>
      <TableHead>Date</TableHead>
      <TableHead className="text-right">Items</TableHead>
      <TableHead className="text-right">Amount</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  );
}

export function SaleTable({
  sales,
  customerNameFor,
  onView,
  onComplete,
  onCancel,
  onDelete,
}: SaleTableProps) {
  return (
    <Table>
      <TableHeader>
        <HeaderRow />
      </TableHeader>
      <TableBody>
        {sales.map((sale) => {
          const totals = getSaleTotals(sale.items);
          const itemCount = sale.items?.length ?? 0;
          const units =
            sale.items?.reduce(
              (sum, item) => sum + (Number(item.quantity) || 0),
              0
            ) ?? 0;
          const isDraft = sale.status === 'DRAFT';
          const customerName = customerNameFor(sale);
          const customerColor = getProductColor(sale.customerId);

          return (
            <TableRow
              key={sale.saleId}
              onClick={() => onView(sale)}
              className="cursor-pointer"
            >
              <TableCell className="whitespace-nowrap text-sm text-slate-900">
                {formatSaleRef(sale.saleId)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold"
                    style={{
                      color: customerColor,
                      borderColor: customerColor,
                      backgroundColor: `${customerColor}1a`,
                    }}
                  >
                    {getInitials(customerName)}
                  </span>
                  <p className="truncate text-sm font-medium text-slate-900">
                    {customerName}
                  </p>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-slate-600">
                {formatDate(sale.createdOn)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                <p className="text-xs text-slate-600 tabular-nums">
                  {itemCount} line{itemCount === 1 ? '' : 's'}
                </p>
                <p className="text-xs text-slate-400 tabular-nums">
                  {formatQuantity(units)} units
                </p>
              </TableCell>
              <TableCell className="whitespace-nowrap text-right text-sm font-medium text-slate-900 tabular-nums">
                {formatMoney(totals.total)}
              </TableCell>
              <TableCell>
                <SaleStatusBadge status={sale.status} />
              </TableCell>
              <TableCell
                className="text-right"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-end gap-0.5">
                  <RowActionButton
                    icon={<Eye className="h-3.5 w-3.5" />}
                    label="View sale"
                    tone="hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => onView(sale)}
                  />
                  {isDraft && (
                    <>
                      <RowActionButton
                        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        label="Complete sale"
                        tone="hover:bg-status-success hover:text-status-success-fg"
                        onClick={() => onComplete(sale)}
                      />
                      <RowActionButton
                        icon={<Ban className="h-3.5 w-3.5" />}
                        label="Cancel order"
                        tone="hover:bg-status-warning hover:text-status-warning-fg"
                        onClick={() => onCancel(sale)}
                      />
                      <RowActionButton
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        label="Delete draft"
                        tone="hover:bg-status-error hover:text-status-error-fg"
                        onClick={() => onDelete(sale)}
                      />
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function SaleTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <HeaderRow />
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index} className="hover:bg-transparent">
            <TableCell>
              <Skeleton className="h-3.5 w-24" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                <Skeleton className="h-3.5 w-36" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-3.5 w-24" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="ml-auto h-3 w-14" />
              <Skeleton className="ml-auto mt-1.5 h-3 w-16" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="ml-auto h-3.5 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16 rounded-md" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="ml-auto h-7 w-24" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
