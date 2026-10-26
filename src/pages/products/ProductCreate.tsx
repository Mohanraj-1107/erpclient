import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Info, Plus } from 'lucide-react';
import { productApi } from '@/api/products';
import type { CreateProductRequest } from '@/types/product';
import { getApiErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/forms/ProductForm';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useToast } from '@/components/common/useToast';

export default function ProductCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductRequest) => productApi.create(payload),
    onSuccess: (created) => {
      toast.success('Product created', `"${created.productName}" was added to your catalog.`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      navigate('/products');
    },
  });

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[{ label: 'Products', to: '/products' }, { label: 'New Product' }]}
        icon={<Plus className="h-4 w-4" />}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/products')}
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
        }
      />

      <ProductForm
        submitLabel="Create Product"
        submitting={createMutation.isPending}
        serverError={
          createMutation.isError
            ? getApiErrorMessage(createMutation.error, 'Failed to create product.')
            : undefined
        }
        onSubmit={(payload) => createMutation.mutate(payload)}
        onCancel={() => navigate('/products')}
      />

      <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3.5 py-2.5 text-xs text-indigo-700">
        <Info className="h-3.5 w-3.5 shrink-0" />
        An inventory record is created automatically for every new product.
      </div>
    </div>
  );
}
