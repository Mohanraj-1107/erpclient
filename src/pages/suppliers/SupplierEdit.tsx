import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import { supplierApi } from '@/api/suppliers';
import type {
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from '@/types/supplier';
import { getApiErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/common/Alert';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { SupplierForm } from '@/components/forms/SupplierForm';
import { useToast } from '@/components/common/useToast';

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

export default function SupplierEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
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

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSupplierRequest) =>
      supplierApi.update(supplierId, payload),
    onSuccess: (updated) => {
      toast.success(
        'Supplier updated',
        `"${updated.supplierName}" was saved successfully.`
      );
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', supplierId] });
      navigate('/suppliers');
    },
  });

  if (!Number.isFinite(supplierId)) {
    return <Alert tone="error">Invalid supplier id.</Alert>;
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'Suppliers', to: '/suppliers' },
          { label: supplier?.supplierName ?? 'Edit Supplier' },
        ]}
        icon={<Pencil className="h-4 w-4" />}
        className="border-indigo-100/80 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 shadow-sm shadow-indigo-100/40"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/suppliers')}
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
        <Alert tone="error">{getApiErrorMessage(error, 'Failed to load supplier.')}</Alert>
      ) : supplier ? (
        <SupplierForm
          key={supplier.supplierId}
          initial={supplier}
          submitLabel="Save Changes"
          submitting={updateMutation.isPending}
          serverError={
            updateMutation.isError
              ? getApiErrorMessage(updateMutation.error, 'Failed to update supplier.')
              : undefined
          }
          onSubmit={(payload: CreateSupplierRequest) => updateMutation.mutate(payload)}
          onCancel={() => navigate('/suppliers')}
        />
      ) : null}
    </div>
  );
}
