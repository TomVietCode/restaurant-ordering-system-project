import { api } from '@/services/api';
import { AUTH_ENDPOINTS } from '@/lib/constants';
import type { ApiResponse, LoginPayload, TokenResponse, User } from '@/types';

/** Calls to the backend auth endpoints. No UI logic here (see convention 4.2). */
export const authService = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await api.post<ApiResponse<TokenResponse>>(
      AUTH_ENDPOINTS.login,
      payload,
    );
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post(AUTH_ENDPOINTS.logout);
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>(AUTH_ENDPOINTS.profile);
    return data.data;
  },
};
