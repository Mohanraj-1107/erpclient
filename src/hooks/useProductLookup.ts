import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/api/products';
import type { Product } from '@/types/product';

/**
 * Loads the product catalogue once and exposes it as a lookup map. Inventory
 * responses only carry the product name/unit, so this adds the code and the
 * minimum-stock threshold without making a request per row.
 */
export function useProductLookup() {
  const query = useQuery({
    queryKey: ['products', 'all'],
    queryFn: productApi.listAll,
    staleTime: 60_000,
  });

  const productsById = useMemo(() => {
    const map = new Map<number, Product>();
    query.data?.forEach((product) => map.set(product.productId, product));
    return map;
  }, [query.data]);

  return {
    productsById,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
