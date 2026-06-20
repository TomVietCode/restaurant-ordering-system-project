import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/**
 * Cấu hình Auth.js (NextAuth v5).
 *
 * Credentials provider gọi backend NestJS (`/auth/login` + `/auth/profile`),
 * rồi nhét `role` + `accessToken` vào JWT/session của Auth.js để server đọc được.
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
        };
      },
    }),
  ],
  callbacks: {
    // Nhét role + token vào JWT của Auth.js (chạy mỗi lần tạo/đọc token).
    jwt({ token, user }) {
      if (user) {
        const u = user as { role: string; accessToken: string };
        token.role = u.role;
        token.accessToken = u.accessToken;
      }
      return token;
    },
    // Expose ra session để server/client đọc được role + token.
    session({ session, token }) {
      if (token.role) session.user.role = token.role as string;
      if (token.accessToken) session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
