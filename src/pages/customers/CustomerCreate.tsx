import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Info, UserPlus } from 'lucide-react';
import { customerApi } from '@/api/customers';
import type { CreateCustomerRequest } from '@/types/customer';
import { getApiErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useToast } from '@/components/common/useToast';

export default function CustomerCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const createMutation = useMutation({
    mutationFn: (payload: CreateCustomerRequest) => customerApi.create(payload),
    onSuccess: (created) => {
      toast.success(
        'Customer created',
        `"${created.customerName}" was added to your customers.`
      );
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/customers');
    },
  });

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'Customers', to: '/customers' },
          { label: 'New Customer' },
        ]}
        icon={<UserPlus className="h-4 w-4" />}
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

      <CustomerForm
        submitLabel="Create Customer"
        submitting={createMutation.isPending}
        serverError={
          createMutation.isError
            ? getApiErrorMessage(createMutation.error, 'Failed to create customer.')
            : undefined
        }
        onSubmit={(payload) => createMutation.mutate(payload)}
        onCancel={() => navigate('/customers')}
      />

      <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-emerald-50/50 px-3.5 py-2.5 text-xs text-indigo-700">
        <Info className="h-3.5 w-3.5 shrink-0" />
        Customer emails must be unique within your organization.
      </div>
    </div>
  );
}
