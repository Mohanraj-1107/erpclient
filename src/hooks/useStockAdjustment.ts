import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/api/inventory';
import type { InventoryItem, StockAdjustmentMode } from '@/types/inventory';
import { formatQuantity, getApiErrorMessage } from '@/lib/utils';
import { useToast } from '@/components/common/useToast';

interface PendingAdjustment {
  item: InventoryItem;
  mode: StockAdjustmentMode;
}

export function useStockAdjustment() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [adjustment, setAdjustment] = useState<PendingAdjustment | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      item,
      mode,
      quantity,
    }: PendingAdjustment & { quantity: number }) => {
      const updated =
        mode === 'add'
          ? await inventoryApi.addStock(item.productId, { quantity })
          : await inventoryApi.removeStock(item.productId, { quantity });

      return { updated, mode, quantity };
    },
    onSuccess: ({ updated, mode, quantity }) => {
      const unit = updated.unit.toLowerCase();
      toast.success(
        mode === 'add' ? 'Stock added' : 'Stock removed',
        mode === 'add'
          ? `Added ${formatQuantity(quantity)} ${unit} to "${updated.productName}".`
          : `Removed ${formatQuantity(quantity)} ${unit} from "${updated.productName}".`
      );
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setAdjustment(null);
    },
  });

  const openAdjustment = (item: InventoryItem, mode: StockAdjustmentMode) => {
    mutation.reset();
    setAdjustment({ item, mode });
  };

  const closeAdjustment = () => {
    mutation.reset();
    setAdjustment(null);
  };

  const confirmAdjustment = (quantity: number) => {
    if (!adjustment) return;
    mutation.mutate({ ...adjustment, quantity });
  };

  return {
    adjustment,
    openAdjustment,
    closeAdjustment,
    confirmAdjustment,
    clearError: mutation.reset,
    isPending: mutation.isPending,
    serverError: mutation.isError
      ? getApiErrorMessage(mutation.error, 'Failed to update stock.')
      : undefined,
  };
}
