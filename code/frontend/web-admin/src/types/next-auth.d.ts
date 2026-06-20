// Mở rộng type của Auth.js để có `role` + `accessToken`.
// role để dạng string ('OWNER' | 'STAFF') cho khớp Auth.js; so sánh literal vẫn ok.
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    accessToken: string;
  }

  interface Session {
    accessToken?: string;
    user: {
      role: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    accessToken?: string;
  }
}
