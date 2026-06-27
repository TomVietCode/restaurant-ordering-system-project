import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

// Giải mã exp từ JWT payload (không cần thư viện)
function getExpiry(token: string): number {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString(),
    ) as { exp?: number };
    return (payload.exp ?? 0) * 1000; // chuyển sang ms
  } catch {
    return 0;
  }
}

// Gọi /auth/refresh để lấy accessToken mới
async function refreshAccessToken(jwt: JWT): Promise<JWT> {
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refreshToken=${jwt.refreshToken ?? ''}` },
    });
    if (!res.ok) throw new Error('Refresh failed');

    const newAccessToken = (
      (await res.json()) as { data: { accessToken: string } }
    ).data.accessToken;

    return {
      ...jwt,
      accessToken: newAccessToken,
      accessTokenExpires: getExpiry(newAccessToken),
    };
  } catch {
    // Refresh thất bại → xóa token, buộc đăng nhập lại
    return { ...jwt, accessToken: undefined, accessTokenExpires: 0 };
  }
}

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
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: creds?.email, password: creds?.password }),
        });
        if (!res.ok) return null;

        const accessToken = (
          (await res.json()) as { data: { accessToken: string } }
        ).data.accessToken;

        // Lấy refreshToken từ Set-Cookie header của NestJS
        const setCookie = res.headers.get('set-cookie') ?? '';
        const refreshToken = setCookie.match(/refreshToken=([^;]+)/)?.[1] ?? '';

        const profileRes = await fetch(`${API}/auth/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!profileRes.ok) return null;

        const u = (
          (await profileRes.json()) as { data: { id: number; email: string; fullName: string; role: string } }
        ).data;

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
      // Lần đầu đăng nhập — lưu đầy đủ thông tin
      if (user) {
        const u = user as { role: string; accessToken: string; refreshToken: string };
        return {
          ...token,
          role: u.role,
          accessToken: u.accessToken,
          accessTokenExpires: getExpiry(u.accessToken),
          refreshToken: u.refreshToken,
        };
      }

      // Token còn hạn (trừ 30 giây buffer) → dùng tiếp
      if (Date.now() < (token.accessTokenExpires ?? 0) - 30_000) {
        return token;
      }

      // Token hết hạn → refresh
      return refreshAccessToken(token);
    },

    session({ session, token }) {
      session.accessToken = token.accessToken;
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
});
