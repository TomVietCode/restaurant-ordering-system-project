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
    throw new Error(`API ${res.status} ${res.statusText}: ${await res.text()}`);
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
