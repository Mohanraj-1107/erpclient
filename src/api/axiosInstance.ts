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

export const authClient = axios.create({
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

/**
 * Single-flight refresh token request.
 *
 * While a `/v1/refresh` call is in flight, every caller shares the same promise
 * so that multiple simultaneous 401s trigger only one refresh request. Once the
 * refresh settles (success or failure) the promise is cleared so the next expired
 * session can refresh again.
 */
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

function isAuthRequest(url: string | undefined): boolean {
  if (!url) return false;
  return ['/v1/login', '/v1/refresh', '/v1/logout'].some((path) =>
    url.includes(path)
  );
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Only attempt token refresh for real 401 responses on non-auth endpoints.
    if (!original || err.response?.status !== 401) {
      return Promise.reject(err);
    }

    // Auth endpoints (login/refresh/logout) must never trigger a refresh loop.
    if (isAuthRequest(original.url)) {
      return Promise.reject(err);
    }

    // Already retried once after a refresh. The access token could not be
    // restored, so stop retrying, clear the stored org id, and send the user
    // back to the login screen instead of surfacing a raw unhandled 401.
    if (original._retry) {
      clearStoredOrgId();
      window.location.href = '/login';
      return Promise.reject(err);
    }

    original._retry = true;

    try {
      await refreshSession();
      // Retry the original request; withCredentials sends the new access token
      // cookie that `/v1/refresh` just set.
      return api(original);
    } catch {
      // Refresh token itself is expired/invalid — clear session and re-login.
      clearStoredOrgId();
      window.location.href = '/login';
      return Promise.reject(err);
    }
  }
);

export default api;
