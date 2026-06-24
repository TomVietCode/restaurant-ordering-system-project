import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

/**
 * Axios instance dùng chung cho toàn app.
 *
 * Cách dùng:
 *
 * ① Server Component (page/layout async) — gắn token thủ công:
 *   import { auth } from '@/auth';
 *   import { apiWithToken } from '@/lib/api';
 *
 *   const session = await auth();
 *   const api = apiWithToken(session?.accessToken);
 *   const data = await api.get('/items');
 *
 * ② Client Component ('use client') — dùng apiClient trực tiếp:
 *   import { apiClient } from '@/lib/api';
 *   const data = await apiClient.get('/items');
 *   (token được gắn qua interceptor từ cookie của trình duyệt — yêu cầu withCredentials)
 */

// Instance cơ bản — dùng cho cả 2 trường hợp
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // gửi kèm cookie (Auth.js session)
});

/**
 * Tạo axios instance với token cụ thể — dùng trong Server Component.
 * Token lấy từ Auth.js session: session?.accessToken
 */
export function apiWithToken(token?: string | null) {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
