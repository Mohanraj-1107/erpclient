import api from '@/api/axiosInstance';
import type { Organization } from '@/types/organization';

export const orgApi = {
  get: async (orgId: number): Promise<Organization> => {
    const { data } = await api.get<Organization>(`/v1/org/${orgId}`);
    return data;
  },
};
