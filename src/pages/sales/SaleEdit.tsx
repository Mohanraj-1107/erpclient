import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import { saleApi } from '@/api/sales';
import type { CreateSaleRequest } from '@/types/sales';
import { getApiErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/common/Alert';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { SaleForm } from '@/components/forms/SaleForm';
import { useToast } from '@/components/common/useToast';

interface UpdateSaleRequest {
  customerId?: number;
  items?: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discountRate: number;
  }>;
}

function EditSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex justify-end gap-2 p-4">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-32" />
      </Card>
    </div>
  );
}

export default function SaleEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const saleId = Number(id);

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

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSaleRequest) =>
      saleApi.update(saleId, payload),
    onSuccess: (updated) => {
      toast.success(
        'Sale updated',
        `"${updated.customerName}" was saved successfully.`
      );
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      navigate('/sales');
    },
  });

  if (!Number.isFinite(saleId)) {
    return <Alert tone="error">Invalid sale id.</Alert>;
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'Sales', to: '/sales' },
          { label: sale?.customerName ?? 'Edit Sale' },
        ]}
        icon={<Pencil className="h-4 w-4" />}
        className="border-slate-200/80 bg-slate-200/70 shadow-xs backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/sales')}
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
        }
      />

      {isLoading ? (
        <EditSkeleton />
      ) : isError ? (
        <Alert tone="error">{getApiErrorMessage(error, 'Failed to load sale.')}</Alert>
      ) : sale ? (
        <SaleForm
          key={sale.saleId}
          initial={sale}
          submitLabel="Save Changes"
          submitting={updateMutation.isPending}
          serverError={
            updateMutation.isError
              ? getApiErrorMessage(updateMutation.error, 'Failed to update sale.')
              : undefined
          }
          onSubmit={(payload: CreateSaleRequest) => updateMutation.mutate(payload)}
          onCancel={() => navigate('/sales')}
        />
      ) : null}
    </div>
  );
}
