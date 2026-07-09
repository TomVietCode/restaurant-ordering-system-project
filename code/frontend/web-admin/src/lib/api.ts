import { API_BASE_URL } from '@/lib/constants';

/**
 * Fetch wrapper dùng chung cho toàn app (thay cho axios).
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
 *   (token đi kèm cookie của trình duyệt — nhờ credentials: 'include')
 *
 * Lưu ý khác axios:
 *   - Trả thẳng JSON (không có `.data`).
 *   - fetch KHÔNG tự ném khi 4xx/5xx → wrapper tự throw để chỗ gọi bắt được.
 */

type Options = Omit<RequestInit, 'body'> & {
  token?: string | null;
  body?: unknown;
};

/** Lỗi API có kèm HTTP status — để chỗ gọi phân biệt 401 (hết phiên/bị khóa) với lỗi khác. */
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const { token, body, headers, method = 'GET', ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    credentials: 'include', // gửi kèm cookie (Auth.js session) — tương đương withCredentials
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(data.message)) message = data.message.join(', ');
      else if (data.message) message = data.message;
    } catch {
      // body không phải JSON hợp lệ — giữ statusText
    }
    // 401 phía client = phiên hết hạn hoặc tài khoản bị khóa (backend trả
    // "Account has been deactivated") → đăng xuất và đưa về /login thay vì crash.
    // (accessToken được auto-refresh nên 401 giữa phiên gần như chắc chắn là bị khóa/thu hồi.)
    if (res.status === 401 && typeof window !== 'undefined') {
      const { signOut } = await import('next-auth/react');
      void signOut({ callbackUrl: '/login?error=locked' });
    }
    throw new ApiError(message, res.status);
  }
  // 204 No Content → không có body để parse.
  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>);
}

/** Tập hợp các method tiện dụng, gắn sẵn token (nếu có). */
function makeApi(token?: string | null) {
  return {
    get: <T>(path: string) => request<T>(path, { token }),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body, token }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PATCH', body, token }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PUT', body, token }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE', token }),
  };
}

/**
 * Instance dùng cho Client Component — token đi theo cookie trình duyệt.
 */
export const apiClient = makeApi();

/**
 * Tạo instance với token cụ thể — dùng trong Server Component.
 * Token lấy từ Auth.js session: session?.accessToken
 */
export function apiWithToken(token?: string | null) {
  return makeApi(token);
}
