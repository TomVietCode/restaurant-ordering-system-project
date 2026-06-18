import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL, AUTH_ENDPOINTS, ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiResponse, TokenResponse } from '@/types';

/**
 * Central axios instance.
 *
 * - `withCredentials` so the httpOnly refreshToken cookie is sent to the backend.
 * - A request interceptor attaches the in-memory access token.
 * - A response interceptor performs a single silent refresh on a 401, then
 *   retries the original request once.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the current access token to every outgoing request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A single in-flight refresh shared by all concurrent 401s (single-flight).
let refreshPromise: Promise<string> | null = null;

/** Exchange the refresh cookie for a fresh access token. */
const refreshAccessToken = async (): Promise<string> => {
  // Bare axios call so this request does not recurse through the interceptors.
  const { data } = await axios.post<ApiResponse<TokenResponse>>(
    `${API_BASE_URL}${AUTH_ENDPOINTS.refresh}`,
    {},
    { withCredentials: true },
  );
  const token = data.data.accessToken;
  useAuthStore.getState().setAccessToken(token);
  return token;
};

/** Clear local auth state and bounce to the login page (FR-01.4). */
const handleAuthFailure = (): void => {
  useAuthStore.getState().clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = ROUTES.login;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const url = original?.url ?? '';
    const isAuthRoute =
      url.includes(AUTH_ENDPOINTS.login) ||
      url.includes(AUTH_ENDPOINTS.refresh);

    // Try a silent refresh at most once per request, never on auth routes.
    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        handleAuthFailure();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
