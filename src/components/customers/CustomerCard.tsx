import type { ReactNode } from 'react';
import { Eye, FileBadge, MapPin, Pencil, Phone, Trash2 } from 'lucide-react';
import type { Customer } from '@/types/customer';
import { cn } from '@/lib/utils';
import { getInitials, getProductColor } from '@/lib/productVisuals';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerCardProps {
  customer: Customer;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function getShortAddress(customer: Customer): { text: string; extra: number } {
  const addresses = customer.address ?? [];
  const primary = addresses[0];

  if (!primary) {
    return { text: 'No address on file', extra: 0 };
  }

  const text =
    [primary.city, primary.state, primary.pincode].filter(Boolean).join(', ') ||
    primary.street ||
    'Address on file';

  return { text, extra: Math.max(addresses.length - 1, 0) };
}

function DetailRow({
  icon,
  tone,
  children,
}: {
  icon: ReactNode;
  tone: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 text-xs text-slate-600">
      <span
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1',
          tone
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 break-words pt-0.5">{children}</span>
    </div>
  );
}

export function CustomerCard({
  customer,
  onView,
  onEdit,
  onDelete,
}: CustomerCardProps) {
  const color = getProductColor(customer.customerId);
  const address = getShortAddress(customer);

  return (
    <Card className="group flex flex-col overflow-hidden border-slate-200/80 transition-all hover:-translate-y-0.5 hover:border-indigo-200/70 hover:shadow-md hover:shadow-indigo-100/50">
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}55)`,
        }}
      />

      <div
        className="relative overflow-hidden p-4"
        style={{
          background: `linear-gradient(135deg, ${color}10 0%, rgba(255,255,255,0) 62%)`,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full"
          style={{ backgroundColor: `${color}12` }}
        />

        <div className="relative flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-xs font-bold shadow-sm ring-2 ring-white transition-transform duration-200 group-hover:scale-105"
            style={{
              color,
              borderColor: color,
              backgroundColor: `${color}1a`,
            }}
          >
            {getInitials(customer.customerName)}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-semibold text-slate-900"
              title={customer.customerName}
            >
              {customer.customerName}
            </p>
            <p
              className="truncate text-xs text-slate-500"
              title={customer.customerEmail}
            >
              {customer.customerEmail}
            </p>
          </div>
        </div>

        <div className="relative mt-4 space-y-2.5">
          <DetailRow
            icon={<Phone className="h-3.5 w-3.5" />}
            tone="bg-emerald-50 text-emerald-600 ring-emerald-100"
          >
            {customer.mobileNo || '—'}
          </DetailRow>

          <DetailRow
            icon={<MapPin className="h-3.5 w-3.5" />}
            tone="bg-indigo-50 text-indigo-600 ring-indigo-100"
          >
            <span className="line-clamp-2" title={address.text}>
              {address.text}
            </span>
            {address.extra > 0 && (
              <span className="ml-1 whitespace-nowrap text-slate-400">
                +{address.extra} more
              </span>
            )}
          </DetailRow>

          <DetailRow
            icon={<FileBadge className="h-3.5 w-3.5" />}
            tone="bg-amber-50 text-amber-600 ring-amber-100"
          >
            <span className="text-slate-400">GST</span>{' '}
            <span className="font-mono text-[11px] uppercase tracking-wide text-slate-600">
              {customer.gstNo || '—'}
            </span>
          </DetailRow>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-end gap-1 border-t border-slate-100 bg-slate-50/40 px-3 py-2.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onView}
          className="gap-1.5 px-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
          aria-label={`View ${customer.customerName}`}
          title="View customer"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="gap-1.5 px-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
          aria-label={`Edit ${customer.customerName}`}
          title="Edit customer"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="gap-1.5 px-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label={`Delete ${customer.customerName}`}
          title="Delete customer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </Card>
  );
}

export function CustomerCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="h-1 w-full rounded-none bg-indigo-100" />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg bg-indigo-50" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {['bg-emerald-50', 'bg-indigo-50', 'bg-amber-50'].map((tone) => (
            <div key={tone} className="flex items-center gap-2.5">
              <Skeleton className={cn('h-6 w-6 shrink-0 rounded-md', tone)} />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex justify-end gap-1 border-t border-slate-100 bg-slate-50/40 px-3 py-2.5">
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-7 w-16 rounded-md" />
      </div>
    </Card>
  );
}
