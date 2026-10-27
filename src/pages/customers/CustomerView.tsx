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
  Users,
} from 'lucide-react';
import { customerApi } from '@/api/customers';
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
    card: 'border-indigo-100 bg-indigo-50/40',
    tile: 'bg-indigo-100 text-indigo-600 ring-indigo-200',
  },
  {
    card: 'border-emerald-100 bg-emerald-50/40',
    tile: 'bg-emerald-100 text-emerald-600 ring-emerald-200',
  },
  {
    card: 'border-amber-100 bg-amber-50/40',
    tile: 'bg-amber-100 text-amber-600 ring-amber-200',
  },
  {
    card: 'border-rose-100 bg-rose-50/40',
    tile: 'bg-rose-100 text-rose-600 ring-rose-200',
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

export default function CustomerView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);

  const {
    data: customer,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerApi.get(customerId),
    enabled: Number.isFinite(customerId),
  });

  if (!Number.isFinite(customerId)) {
    return <Alert tone="error">Invalid customer id.</Alert>;
  }

  const addresses = customer?.address ?? [];
  const avatarColor = getProductColor(customerId);

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'Customers', to: '/customers' },
          { label: customer?.customerName ?? 'Customer' },
        ]}
        icon={<Eye className="h-4 w-4" />}
        className="border-indigo-100/80 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 shadow-sm shadow-indigo-100/40"
        action={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/customers')}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/customers/${customerId}/edit`)}
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
        <Alert tone="error">{getApiErrorMessage(error, 'Failed to load customer.')}</Alert>
      ) : customer ? (
        <div className="space-y-4">
          <Card className="overflow-hidden border-slate-200/80">
            <div
              className="h-1.5 w-full"
              style={{
                background: `linear-gradient(90deg, ${avatarColor}, ${avatarColor}66)`,
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
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border text-lg font-semibold shadow-sm ring-2 ring-white"
                    style={{
                      color: avatarColor,
                      borderColor: avatarColor,
                      backgroundColor: `${avatarColor}1a`,
                    }}
                  >
                    {getInitials(customer.customerName)}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-slate-900">
                      {customer.customerName}
                    </h2>
                    <p className="truncate text-sm text-slate-500">
                      {customer.customerEmail}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-emerald-500" />
                        {customer.mobileNo || '—'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                        {addresses.length} address{addresses.length === 1 ? '' : 'es'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-lg border border-amber-100 bg-amber-50/70 px-3.5 py-2.5 shadow-2xs">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 ring-1 ring-amber-200">
                    <FileBadge className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-amber-500">
                      GST number
                    </p>
                    <p className="font-mono text-xs font-medium uppercase text-amber-800">
                      {customer.gstNo || '—'}
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle>Contact information</CardTitle>
                    <CardDescription>How to reach this customer.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={customer.customerEmail}
                    tone="bg-indigo-50 text-indigo-600 ring-indigo-100"
                  />
                  <InfoRow
                    icon={<Phone className="h-4 w-4" />}
                    label="Mobile"
                    value={customer.mobileNo}
                    tone="bg-emerald-50 text-emerald-600 ring-emerald-100"
                  />
                  <InfoRow
                    icon={<FileBadge className="h-4 w-4" />}
                    label="GST number"
                    value={customer.gstNo}
                    tone="bg-amber-50 text-amber-600 ring-amber-100"
                    className="sm:col-span-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200">
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
                    <p className="rounded-lg border border-dashed border-indigo-100 bg-indigo-50/40 px-4 py-6 text-center text-xs text-indigo-400">
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 ring-1 ring-amber-200">
                    <Hash className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle>Record details</CardTitle>
                    <CardDescription>Internal customer information.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <RecordRow
                    label="Customer ID"
                    value={`#${customer.customerId}`}
                  />
                  <RecordRow
                    label="Created"
                    value={formatDateTime(customer.createdOn)}
                  />
                  <RecordRow
                    label="Last updated"
                    value={formatDateTime(customer.modifiedOn)}
                  />
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-emerald-50/60 p-5 shadow-sm shadow-indigo-100/40">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-700">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200">
                    <Users className="h-3.5 w-3.5" />
                  </span>
                  Need to update this customer?
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/customers/${customerId}/edit`)}
                  className="mt-3 w-full gap-1.5 shadow-sm shadow-indigo-200"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit customer
                </Button>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
