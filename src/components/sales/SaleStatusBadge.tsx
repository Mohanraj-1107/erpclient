import type { SaleStatus } from '@/types/sales';
import { cn } from '@/lib/utils';

const STATUS_TONES: Record<SaleStatus, string> = {
  DRAFT:
    'bg-status-warning-border/60 text-status-warning-fg ring-status-warning-border',
  COMPLETED:
    'bg-status-success-border/60 text-status-success-fg ring-status-success-border',
  CANCELLED:
    'bg-status-error-border/60 text-status-error-fg ring-status-error-border',
};

const STATUS_LABEL: Record<SaleStatus, string> = {
  DRAFT: 'Draft',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function SaleStatusBadge({
  status,
  className,
}: {
  status: SaleStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1',
        STATUS_TONES[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
