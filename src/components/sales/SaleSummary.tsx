import type { ReactNode } from 'react';
import { CheckCircle2, Clock, IndianRupee, ShoppingCart } from 'lucide-react';
import { cn, formatMoney } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function SummaryTile({
  label,
  value,
  caption,
  icon,
  tone,
}: {
  label: string;
  value: ReactNode;
  caption?: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <Card className="flex items-start gap-3 p-4">
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
          tone
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-900 tabular-nums">
          {value}
        </p>
        {caption && <p className="text-xs text-slate-400">{caption}</p>}
      </div>
    </Card>
  );
}

export interface SaleSummaryStats {
  totalOrders: number | string;
  draftCount: number;
  completedCount: number;
  pageValue: number;
}

export function SaleSummary({
  stats,
  loading,
}: {
  stats: SaleSummaryStats;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="flex items-start gap-3 p-4">
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryTile
        label="Sales orders"
        value={stats.totalOrders}
        icon={<ShoppingCart className="h-4 w-4" />}
        tone="bg-indigo-50 text-indigo-600 ring-indigo-100"
      />
      <SummaryTile
        label="Draft"
        value={stats.draftCount}
        caption="Awaiting completion"
        icon={<Clock className="h-4 w-4" />}
        tone="bg-status-warning text-status-warning-fg ring-status-warning-border"
      />
      <SummaryTile
        label="Completed"
        value={stats.completedCount}
        caption="Stock delivered"
        icon={<CheckCircle2 className="h-4 w-4" />}
        tone="bg-status-success text-status-success-fg ring-status-success-border"
      />
      <SummaryTile
        label="Value on this page"
        value={formatMoney(stats.pageValue)}
        icon={<IndianRupee className="h-4 w-4" />}
        tone="bg-indigo-50 text-indigo-600 ring-indigo-100"
      />
    </div>
  );
}
