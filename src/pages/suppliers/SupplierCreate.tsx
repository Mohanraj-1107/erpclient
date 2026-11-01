import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Info, Truck } from 'lucide-react';
import { supplierApi } from '@/api/suppliers';
import type { CreateSupplierRequest } from '@/types/supplier';
import { getApiErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SupplierForm } from '@/components/forms/SupplierForm';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useToast } from '@/components/common/useToast';

export default function SupplierCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const createMutation = useMutation({
    mutationFn: (payload: CreateSupplierRequest) => supplierApi.create(payload),
    onSuccess: (created) => {
      toast.success(
        'Supplier created',
        `"${created.supplierName}" was added to your suppliers.`
      );
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      navigate('/suppliers');
    },
  });

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'Suppliers', to: '/suppliers' },
          { label: 'New Supplier' },
        ]}
        icon={<Truck className="h-4 w-4" />}
        className="border-slate-200/80 bg-slate-200/70 shadow-xs backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
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

      <SupplierForm
        submitLabel="Create Supplier"
        submitting={createMutation.isPending}
        serverError={
          createMutation.isError
            ? getApiErrorMessage(createMutation.error, 'Failed to create supplier.')
            : undefined
        }
        onSubmit={(payload) => createMutation.mutate(payload)}
        onCancel={() => navigate('/suppliers')}
      />

      <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-theme-surface-muted px-3.5 py-2.5 text-xs text-theme-text-muted">
        <Info className="h-3.5 w-3.5 shrink-0" />
        Supplier emails must be unique within your organization.
      </div>
    </div>
  );
}
