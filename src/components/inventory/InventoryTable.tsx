import { Minus, Plus } from 'lucide-react';
import type { InventoryItem, StockAdjustmentMode } from '@/types/inventory';
import type { Product } from '@/types/product';
import { cn, formatDate, formatQuantity, formatTime } from '@/lib/utils';
import { getInitials, getProductColor } from '@/lib/productVisuals';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InventoryTableProps {
  items: InventoryItem[];
  productsById: Map<number, Product>;
  onAdjust: (item: InventoryItem, mode: StockAdjustmentMode) => void;
  lowStockIds?: Set<number>;
  showDeficit?: boolean;
  disabled?: boolean;
}

const COLUMN_WIDTHS = {
  product: 'w-[27%]',
  unit: 'w-[11%]',
  onHand: 'w-[12%]',
  minStock: 'w-[12%]',
  status: 'w-[13%]',
  detail: 'w-[13%]',
  actions: 'w-[12%]',
} as const;

function InventoryTableHead({ showDeficit }: { showDeficit: boolean }) {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className={cn(COLUMN_WIDTHS.product, 'whitespace-nowrap')}>
          Product
        </TableHead>
        <TableHead className={cn(COLUMN_WIDTHS.unit, 'whitespace-nowrap')}>
          Unit
        </TableHead>
        <TableHead
          className={cn(COLUMN_WIDTHS.onHand, 'whitespace-nowrap text-right')}
        >
          On hand
        </TableHead>
        <TableHead
          className={cn(COLUMN_WIDTHS.minStock, 'whitespace-nowrap text-right')}
        >
          Min stock
        </TableHead>
        <TableHead className={cn(COLUMN_WIDTHS.status, 'whitespace-nowrap')}>
          Status
        </TableHead>
        <TableHead
          className={cn(COLUMN_WIDTHS.detail, 'whitespace-nowrap text-right')}
        >
          {showDeficit ? 'Deficit' : 'Updated'}
        </TableHead>
        <TableHead
          className={cn(COLUMN_WIDTHS.actions, 'whitespace-nowrap text-right')}
        >
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

function StockStatusBadge({
  quantity,
  isLow,
  known,
}: {
  quantity: number;
  isLow: boolean;
  known: boolean;
}) {
  if (!known) {
    return <span className="text-xs text-slate-300">—</span>;
  }

  if (quantity <= 0) {
    return (
      <Badge variant="danger" className="font-normal normal-case tracking-normal">
        out
      </Badge>
    );
  }

  if (isLow) {
    return (
      <Badge variant="warning" className="font-normal normal-case tracking-normal">
        low
      </Badge>
    );
  }

  return (
    <Badge variant="success" className="font-normal normal-case tracking-normal">
      in stock
    </Badge>
  );
}

function QuantityValue({
  value,
  valueClassName,
}: {
  value: number;
  valueClassName?: string;
}) {
  return (
    <span
      className={cn(
        'inline-block whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-slate-900',
        valueClassName
      )}
    >
      {formatQuantity(value)}
    </span>
  );
}

export function InventoryTable({
  items,
  productsById,
  onAdjust,
  lowStockIds,
  showDeficit = false,
  disabled = false,
}: InventoryTableProps) {
  return (
    <Table className="min-w-[920px] table-fixed">
      <InventoryTableHead showDeficit={showDeficit} />

      <TableBody>
        {items.map((item, index) => {
          const product = productsById.get(item.productId);
          const minimumStock = product?.minimumStock;
          const isLow = showDeficit
            ? true
            : minimumStock !== undefined
              ? item.quantity <= minimumStock
              : (lowStockIds?.has(item.productId) ?? false);
          const statusKnown =
            showDeficit || minimumStock !== undefined || lowStockIds !== undefined;
          const deficit =
            minimumStock !== undefined
              ? Math.max(minimumStock - item.quantity, 0)
              : null;
          const color = getProductColor(index);

          return (
            <TableRow key={item.inventoryId} className="hover:bg-indigo-50/30">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold"
                    style={{
                      color,
                      borderColor: color,
                      backgroundColor: `${color}1a`,
                    }}
                  >
                    {getInitials(item.productName)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-normal text-slate-900"
                      title={item.productName}
                    >
                      {item.productName}
                    </p>
                    {product?.productCode && (
                      <p
                        className="truncate font-mono text-[11px] text-slate-400"
                        title={product.productCode}
                      >
                        {product.productCode}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant="info"
                  className="whitespace-nowrap px-1.5 font-normal"
                >
                  {item.unit}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <QuantityValue
                  value={item.quantity}
                  valueClassName="font-normal text-slate-900"
                />
              </TableCell>

              <TableCell className="text-right">
                {minimumStock !== undefined ? (
                  <QuantityValue
                    value={minimumStock}
                    valueClassName="text-xs font-medium text-slate-500"
                  />
                ) : (
                  <span className="text-xs text-slate-300">—</span>
                )}
              </TableCell>

              <TableCell className="whitespace-nowrap">
                <StockStatusBadge
                  quantity={item.quantity}
                  isLow={isLow}
                  known={statusKnown}
                />
              </TableCell>

              {showDeficit ? (
                <TableCell className="text-right">
                  {deficit !== null ? (
                    <QuantityValue
                      value={deficit}
                      valueClassName="text-xs font-semibold text-red-600"
                    />
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </TableCell>
              ) : (
                <TableCell className="text-right">
                  {item.modifiedOn ? (
                    <div className="whitespace-nowrap">
                      <span className="block text-xs font-medium tabular-nums text-slate-600">
                        {formatDate(item.modifiedOn)}
                      </span>
                      <span className="mt-0.5 block text-[11px] tabular-nums text-slate-400">
                        {formatTime(item.modifiedOn)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </TableCell>
              )}

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAdjust(item, 'add')}
                    disabled={disabled}
                    className="px-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    aria-label={`Add stock to ${item.productName}`}
                    title="Add stock"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAdjust(item, 'remove')}
                    disabled={disabled}
                    className="px-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove stock from ${item.productName}`}
                    title="Remove stock"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function InventoryTableSkeleton({
  showDeficit = false,
}: {
  showDeficit?: boolean;
}) {
  return (
    <Table className="min-w-[920px] table-fixed">
      <InventoryTableHead showDeficit={showDeficit} />

      <TableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRow key={index} className="hover:bg-transparent">
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </TableCell>

            <TableCell>
              <Skeleton className="h-5 w-12 rounded-md" />
            </TableCell>

            <TableCell>
              <div className="flex justify-end">
                <Skeleton className="h-3.5 w-16" />
              </div>
            </TableCell>

            <TableCell>
              <div className="flex justify-end">
                <Skeleton className="h-3.5 w-16" />
              </div>
            </TableCell>

            <TableCell>
              <Skeleton className="h-5 w-20 rounded-md" />
            </TableCell>

            <TableCell>
              <div className="flex justify-end">
                {showDeficit ? (
                  <Skeleton className="h-3.5 w-16" />
                ) : (
                  <div className="space-y-1.5">
                    <Skeleton className="ml-auto h-3 w-20" />
                    <Skeleton className="ml-auto h-2.5 w-14" />
                  </div>
                )}
              </div>
            </TableCell>

            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Skeleton className="h-7 w-8 rounded-md" />
                <Skeleton className="h-7 w-8 rounded-md" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
