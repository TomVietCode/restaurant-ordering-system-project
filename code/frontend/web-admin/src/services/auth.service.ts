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

  /**
   * Verify old password before password change. Generates and sends OTP to email.
   * Calls: `POST /auth/password/verify-password`
   */
  async verifyPassword(token: string | null | undefined, oldPassword: string): Promise<void> {
    await apiWithToken(token).post<ApiRes<null>>('/auth/password/verify-password', { oldPassword });
  },

  /**
   * Request password reset for forgotten password. Generates and sends OTP to email.
   * Calls: `POST /auth/password/forgot`
   */
  async forgotPassword(email: string): Promise<void> {
    await apiWithToken().post<ApiRes<null>>('/auth/password/forgot', { email });
  },

  /**
   * Verify OTP and change password.
   * Calls: `POST /auth/password/verify-otp`
   */
  async verifyOtp(otp: string, newPassword: string): Promise<void> {
    await apiWithToken().post<ApiRes<null>>('/auth/password/verify-otp', { otp, newPassword });
  },
};
