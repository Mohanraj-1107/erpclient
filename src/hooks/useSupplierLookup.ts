import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supplierApi } from '@/api/suppliers';
import type { Supplier } from '@/types/supplier';

/**
 * Loads the supplier directory once and exposes it as a lookup map. Purchase
 * responses may only carry the supplier id, so this adds the name and other
 * contact fields without making a request per row.
 */
export function useSupplierLookup() {
  const query = useQuery({
    queryKey: ['suppliers', 'all'],
    queryFn: supplierApi.listAll,
    staleTime: 60_000,
  });

  const suppliersById = useMemo(() => {
    const map = new Map<number, Supplier>();
    query.data?.forEach((supplier) => map.set(supplier.supplierId, supplier));
    return map;
  }, [query.data]);

  return {
    suppliersById,
    suppliers: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
