import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import { productApi } from '@/api/products';
import type { CreateProductRequest, UpdateProductRequest } from '@/types/product';
import { getApiErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/common/Alert';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { ProductForm } from '@/components/forms/ProductForm';
import { useToast } from '@/components/common/useToast';

function EditSkeleton() {
  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-32" />
      </div>
    </Card>
  );
}

export default function ProductEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.get(productId),
    enabled: Number.isFinite(productId),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProductRequest) => productApi.update(productId, payload),
    onSuccess: (updated) => {
      toast.success('Product updated', `"${updated.productName}" was saved successfully.`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      navigate('/products');
    },
  });

  if (!Number.isFinite(productId)) {
    return <Alert tone="error">Invalid product id.</Alert>;
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <Breadcrumb
        items={[
          { label: 'Products', to: '/products' },
          { label: product?.productName ?? 'Edit Product' },
        ]}
        icon={<Pencil className="h-4 w-4" />}
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

      {isLoading ? (
        <EditSkeleton />
      ) : isError ? (
        <Alert tone="error">{getApiErrorMessage(error, 'Failed to load product.')}</Alert>
      ) : product ? (
        <ProductForm
          initial={product}
          submitLabel="Save Changes"
          submitting={updateMutation.isPending}
          serverError={
            updateMutation.isError
              ? getApiErrorMessage(updateMutation.error, 'Failed to update product.')
              : undefined
          }
          onSubmit={(payload: CreateProductRequest) => updateMutation.mutate(payload)}
          onCancel={() => navigate('/products')}
        />
      ) : null}
    </div>
  );
}
