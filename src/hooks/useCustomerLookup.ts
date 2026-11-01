import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/api/customers';
import type { Customer } from '@/types/customer';

/**
 * Loads the customer list once and exposes it as a lookup map keyed by
 * customerId so sale rows can resolve customer names without extra requests.
 */
export function useCustomerLookup() {
  const query = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: customerApi.listAll,
    staleTime: 60_000,
  });

  const customersById = useMemo(() => {
    const map = new Map<number, Customer>();
    query.data?.forEach((customer) => map.set(customer.customerId, customer));
    return map;
  }, [query.data]);

  return {
    customersById,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
