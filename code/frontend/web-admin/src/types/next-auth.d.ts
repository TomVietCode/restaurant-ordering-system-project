import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    accessToken: string;
    refreshToken: string;
  }

  interface Session {
    accessToken?: string;
    user: { role: string } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    accessToken?: string;
    accessTokenExpires?: number; // unix ms
    refreshToken?: string;
  }
}
