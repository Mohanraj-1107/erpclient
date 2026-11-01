import type { PurchaseStatus } from '@/types/purchase';
import { cn } from '@/lib/utils';

const STATUS_TONES: Record<PurchaseStatus, string> = {
  DRAFT:
    'bg-status-warning-border/60 text-status-warning-fg ring-status-warning-border',
  COMPLETED:
    'bg-status-success-border/60 text-status-success-fg ring-status-success-border',
  CANCELLED:
    'bg-status-error-border/60 text-status-error-fg ring-status-error-border',
};

const STATUS_LABEL: Record<PurchaseStatus, string> = {
  DRAFT: 'Draft',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function PurchaseStatusBadge({
  status,
  className,
}: {
  status: PurchaseStatus;
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
