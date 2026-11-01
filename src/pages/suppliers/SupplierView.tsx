import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Eye,
  FileBadge,
  Hash,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Truck,
} from 'lucide-react';
import { supplierApi } from '@/api/suppliers';
import { cn, formatDateTime, getApiErrorMessage } from '@/lib/utils';
import { getInitials, getProductColor } from '@/lib/productVisuals';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/common/Alert';
import { Breadcrumb } from '@/components/common/Breadcrumb';

const ADDRESS_TONES = [
  {
    card: 'border-theme-border bg-theme-surface-muted',
    tile: 'bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border',
  },
  {
    card: 'border-theme-border bg-theme-surface-muted',
    tile: 'bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border',
  },
  {
    card: 'border-theme-border bg-theme-surface-muted',
    tile: 'bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border',
  },
  {
    card: 'border-theme-border bg-theme-surface-muted',
    tile: 'bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border',
  },
];

function InfoRow({
  icon,
  label,
  value,
  tone,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
          tone
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm text-slate-900">{value || '—'}</p>
      </div>
    </div>
  );
}

function RecordRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-700">{value}</span>
    </div>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full sm:col-span-2" />
            </div>
          </Card>
          <Card className="space-y-3 p-5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-20 w-full" />
          </Card>
        </div>
        <Card className="space-y-3 p-5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </Card>
      </div>
    </div>
  );
}

export default function SupplierView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const supplierId = Number(id);

  const {
    data: supplier,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => supplierApi.get(supplierId),
    enabled: Number.isFinite(supplierId),
  });

  if (!Number.isFinite(supplierId)) {
    return <Alert tone="error">Invalid supplier id.</Alert>;
  }

  const addresses = supplier?.address ?? [];
  const avatarColor = getProductColor(supplierId);

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'Suppliers', to: '/suppliers' },
          { label: supplier?.supplierName ?? 'Supplier' },
        ]}
        icon={<Eye className="h-4 w-4" />}
        className="border-slate-200/80 bg-slate-200/70 shadow-xs backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
        action={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/suppliers')}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/suppliers/${supplierId}/edit`)}
              className="gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </>
        }
      />

      {isLoading ? (
        <ViewSkeleton />
      ) : isError ? (
        <Alert tone="error">{getApiErrorMessage(error, 'Failed to load supplier.')}</Alert>
      ) : supplier ? (
        <div className="space-y-4">
          <Card className="overflow-hidden border-slate-200/80">
            <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, ${avatarColor}, ${avatarColor}55)`,
              }}
            />
            <div
              className="relative overflow-hidden p-5"
              style={{
                background: `linear-gradient(135deg, ${avatarColor}10 0%, rgba(255,255,255,0) 62%)`,
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full"
                style={{ backgroundColor: `${avatarColor}12` }}
              />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-lg font-semibold shadow-sm ring-2 ring-white"
                    style={{
                      color: avatarColor,
                      borderColor: avatarColor,
                      backgroundColor: `${avatarColor}1a`,
                    }}
                  >
                    {getInitials(supplier.supplierName)}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-slate-900">
                      {supplier.supplierName}
                    </h2>
                    <p className="truncate text-sm text-slate-500">
                      {supplier.supplierEmail}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-theme-text-muted" />
                        {supplier.mobileNo || '—'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-theme-text-muted" />
                        {addresses.length} address{addresses.length === 1 ? '' : 'es'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-lg border border-theme-border bg-theme-secondary px-3 py-2 shadow-xs">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-theme-secondary-fg text-theme-secondary ring-1 ring-theme-border">
                    <FileBadge className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-theme-secondary">
                      GST number
                    </p>
                    <p className="font-mono text-xs font-medium uppercase text-theme-text tabular-nums">
                      {supplier.gstNo || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Card>
                <CardHeader className="flex-row items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle>Contact information</CardTitle>
                    <CardDescription>How to reach this supplier.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={supplier.supplierEmail}
                    tone="bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border"
                  />
                  <InfoRow
                    icon={<Phone className="h-4 w-4" />}
                    label="Mobile"
                    value={supplier.mobileNo}
                    tone="bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border"
                  />
                  <InfoRow
                    icon={<FileBadge className="h-4 w-4" />}
                    label="GST number"
                    value={supplier.gstNo}
                    tone="bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border"
                    className="sm:col-span-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle>Addresses</CardTitle>
                    <CardDescription>
                      {addresses.length} address{addresses.length === 1 ? '' : 'es'} on file.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {addresses.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/40 px-4 py-6 text-center text-xs text-slate-400">
                      No addresses on file.
                    </p>
                  ) : (
                    addresses.map((address, index) => {
                      const tone = ADDRESS_TONES[index % ADDRESS_TONES.length];
                      return (
                        <div
                          key={index}
                          className={cn('rounded-lg border p-3.5', tone.card)}
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
                                tone.tile
                              )}
                            >
                              <MapPin className="h-4 w-4" />
                            </span>
                            <div className="space-y-0.5 text-xs text-slate-600">
                              <p className="font-medium text-slate-900">
                                {address.street || '—'}
                              </p>
                              <p>
                                {[address.city, address.district]
                                  .filter(Boolean)
                                  .join(', ') || '—'}
                              </p>
                              <p>
                                {[address.state, address.pincode]
                                  .filter(Boolean)
                                  .join(' ') || '—'}
                              </p>
                              <p>{address.country || '—'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="flex-row items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border">
                    <Hash className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle>Record details</CardTitle>
                    <CardDescription>Internal supplier information.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <RecordRow
                    label="Supplier ID"
                    value={`#${supplier.supplierId}`}
                  />
                  <RecordRow
                    label="Created"
                    value={formatDateTime(supplier.createdOn)}
                  />
                  <RecordRow
                    label="Last updated"
                    value={formatDateTime(supplier.modifiedOn)}
                  />
                </CardContent>
              </Card>

              <Card className="border-theme-border p-5 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-medium text-theme-text">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-theme-secondary text-theme-secondary-fg ring-1 ring-theme-border">
                    <Truck className="h-3.5 w-3.5" />
                  </span>
                  Need to update this supplier?
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/suppliers/${supplierId}/edit`)}
                  className="mt-3 w-full gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit supplier
                </Button>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
