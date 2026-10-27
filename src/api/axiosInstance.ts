import axios from 'axios';
import { clearStoredOrgId, setStoredOrgId } from '@/lib/authStorage';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/erp/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RefreshResponse {
  message: string;
  orgId: number | null;
  status: string;
}

let refreshPromise: Promise<number | null> | null = null;

export async function refreshSession(): Promise<number | null> {
  if (!refreshPromise) {
    refreshPromise = authClient
      .post<RefreshResponse>('/v1/refresh')
      .then(({ data }) => {
        if (data.orgId != null) {
          setStoredOrgId(data.orgId);
        }
        return data.orgId ?? null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const isAuthRequest = ['/v1/login', '/v1/refresh', '/v1/logout'].some((path) =>
      original?.url?.includes(path)
    );

    if (original && err.response?.status === 401 && !original._retry && !isAuthRequest) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch {
        clearStoredOrgId();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
