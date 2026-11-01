import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Info, ShoppingCart } from 'lucide-react';
import { saleApi } from '@/api/sales';
import type { CreateSaleRequest } from '@/types/sales';
import { getApiErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SaleForm } from '@/components/forms/SaleForm';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useToast } from '@/components/common/useToast';

export default function SaleCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const createMutation = useMutation({
    mutationFn: (payload: CreateSaleRequest) => saleApi.create(payload),
    onSuccess: (created) => {
      toast.success(
        'Sale created',
        'The order was saved as a draft and awaits completion.'
      );
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      navigate(`/sales/${created.saleId}`);
    },
  });

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'Sales', to: '/sales' },
          { label: 'New Sale' },
        ]}
        icon={<ShoppingCart className="h-4 w-4" />}
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

      <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-theme-surface-muted px-3.5 py-2.5 text-xs text-theme-text-muted">
        <Info className="h-3.5 w-3.5 shrink-0" />
        Sales are saved as drafts. Completing an order removes the stock from
        inventory.
      </div>

      <SaleForm
        submitLabel="Create Sale"
        submitting={createMutation.isPending}
        serverError={
          createMutation.isError
            ? getApiErrorMessage(createMutation.error, 'Failed to create sale.')
            : undefined
        }
        onSubmit={(payload) => createMutation.mutate(payload)}
        onCancel={() => navigate('/sales')}
      />
    </div>
  );
}
