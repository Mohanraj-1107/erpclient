import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import { customerApi } from '@/api/customers';
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '@/types/customer';
import { getApiErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/common/Alert';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { CustomerForm } from '@/components/forms/CustomerForm';
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

export default function CustomerEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
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

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateCustomerRequest) =>
      customerApi.update(customerId, payload),
    onSuccess: (updated) => {
      toast.success(
        'Customer updated',
        `"${updated.customerName}" was saved successfully.`
      );
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      navigate('/customers');
    },
  });

  if (!Number.isFinite(customerId)) {
    return <Alert tone="error">Invalid customer id.</Alert>;
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'Customers', to: '/customers' },
          { label: customer?.customerName ?? 'Edit Customer' },
        ]}
        icon={<Pencil className="h-4 w-4" />}
        className="border-indigo-100/80 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 shadow-sm shadow-indigo-100/40"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/customers')}
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
        <Alert tone="error">{getApiErrorMessage(error, 'Failed to load customer.')}</Alert>
      ) : customer ? (
        <CustomerForm
          key={customer.customerId}
          initial={customer}
          submitLabel="Save Changes"
          submitting={updateMutation.isPending}
          serverError={
            updateMutation.isError
              ? getApiErrorMessage(updateMutation.error, 'Failed to update customer.')
              : undefined
          }
          onSubmit={(payload: CreateCustomerRequest) => updateMutation.mutate(payload)}
          onCancel={() => navigate('/customers')}
        />
      ) : null}
    </div>
  );
}
