import { apiWithToken } from '@/lib/api';

export interface UserProfile {
  id: number;
  email: string;
  role: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiRes<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const authService = {
  /**
   * Fetch current authenticated user's profile details.
   * Calls: `GET /auth/profile`
   */
  async getProfile(token?: string | null): Promise<UserProfile> {
    const res = await apiWithToken(token).get<ApiRes<UserProfile>>('/auth/profile');
    return res.data;
  },

  /**
   * Update current authenticated user's profile details.
   * Calls: `PATCH /auth/profile`
   */
  async updateProfile(
    token: string | null | undefined,
    dto: { fullName?: string; phone?: string },
  ): Promise<UserProfile> {
    const res = await apiWithToken(token).patch<ApiRes<UserProfile>>('/auth/profile', dto);
    return res.data;
  },
};
