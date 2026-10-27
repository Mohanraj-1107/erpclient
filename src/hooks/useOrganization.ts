import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { refreshSession } from '@/api/axiosInstance';
import { orgApi } from '@/api/org';
import { getStoredOrgId, subscribeToOrgId } from '@/lib/authStorage';

const getServerOrgId = () => null;

export function useOrganization() {
  const orgId = useSyncExternalStore(
    subscribeToOrgId,
    getStoredOrgId,
    getServerOrgId
  );
  const attemptedRefresh = useRef(false);

  useEffect(() => {
    if (orgId !== null || attemptedRefresh.current) return;
    attemptedRefresh.current = true;

    void refreshSession().catch(() => {
      // An expired session will be handled by the API interceptor.
    });
  }, [orgId]);

  const query = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => orgApi.get(orgId as number),
    enabled: orgId !== null,
    staleTime: 5 * 60 * 1000,
  });

  return {
    orgId,
    organization: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
