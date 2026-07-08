import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Ở phía Server (Node.js), sử dụng BACKEND_INTERNAL_URL để gọi trực tiếp container Backend qua mạng nội bộ Docker.
// Ở phía Client (Browser), sử dụng NEXT_PUBLIC_API_URL (đường dẫn tương đối như /api).
const API =
  typeof window === 'undefined'
    ? (process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api');

// Đọc claim `exp` (giây) từ JWT, không cần thư viện ngoài.
function decodeExpiry(jwt: string): number {
  const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString('utf8'));
  return payload.exp * 1000; // ms
}

// Gọi lại /auth/refresh phía server. Vì đây là request server-to-server (không phải browser),
// refreshToken (httpOnly cookie backend set) phải được tự đính vào header Cookie thủ công.
async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${API}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `refreshToken=${refreshToken}` },
  });
  if (!res.ok) throw new Error('Refresh failed');

  const setCookie = res.headers.get('set-cookie');
  const newRefreshToken = setCookie?.match(/refreshToken=([^;]+)/)?.[1] ?? refreshToken;
  const accessToken = (await res.json()).data.accessToken as string;

  return { accessToken, accessTokenExpires: decodeExpiry(accessToken), refreshToken: newRefreshToken };
}

/**
 * Cấu hình Auth.js (NextAuth v5).
 *
 * Credentials provider gọi backend NestJS (`/auth/login` + `/auth/profile`),
 * rồi nhét `role` + `accessToken` + `refreshToken` vào JWT/session của Auth.js.
 * `jwt()` callback tự refresh accessToken khi gần hết hạn (backend accessToken sống 15 phút).
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (creds) => {
        // 1) Đăng nhập lấy accessToken từ NestJS
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: creds?.email,
            password: creds?.password,
          }),
        });
        if (!res.ok) return null; // sai email/mật khẩu → Auth.js báo lỗi

        const accessToken = (await res.json()).data.accessToken as string;

        // Backend set refreshToken vào httpOnly cookie trên response của call server-side này —
        // browser không nhận được cookie này, nên phải tự lấy ra và lưu vào JWT của Auth.js.
        const setCookie = res.headers.get('set-cookie');
        const refreshToken = setCookie?.match(/refreshToken=([^;]+)/)?.[1];
        if (!refreshToken) return null;

        // 2) Lấy profile (id, role, tên) bằng access token
        const profileRes = await fetch(`${API}/auth/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!profileRes.ok) return null;

        const u = (await profileRes.json()).data;
        return {
          id: String(u.id),
          email: u.email,
          name: u.fullName,
          role: u.role,
          accessToken,
          refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { role: string; accessToken: string; refreshToken: string };
        token.role = u.role;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.accessTokenExpires = decodeExpiry(u.accessToken);
        return token;
      }

      // Còn hạn (trừ 60s buffer an toàn) → giữ nguyên token.
      // Buffer PHẢI lớn hơn refetchInterval của SessionProvider (20s, xem (admin)/layout.tsx),
      // nếu không sẽ có khoảng hở giữa 2 lần check khiến token hết hạn trước khi kịp refresh.
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number) - 60_000) {
        return token;
      }

      // Hết hạn → refresh
      try {
        const refreshed = await refreshAccessToken(token.refreshToken as string);
        token.accessToken = refreshed.accessToken;
        token.accessTokenExpires = refreshed.accessTokenExpires;
        token.refreshToken = refreshed.refreshToken;
        delete token.error;
      } catch {
        token.error = 'RefreshAccessTokenError';
      }
      return token;
    },
    // Expose ra session để server/client đọc được role + token + lỗi refresh (nếu có).
    session({ session, token }) {
      if (token.role) session.user.role = token.role as string;
      if (token.accessToken) session.accessToken = token.accessToken as string;
      if (token.error) session.error = token.error as string;
      return session;
    },
  },
});
