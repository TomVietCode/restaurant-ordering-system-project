import { create } from 'zustand';
import type { User } from '@/types/auth';

// NOTE: the access token is kept in memory only (never persisted), for security.
// On a full page reload it is restored via a silent `POST /auth/refresh`, which
// relies on the httpOnly refreshToken cookie set by the backend at login.
interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setAuth: (token: string, user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setAccessToken: (token) =>
    set({ accessToken: token, isAuthenticated: Boolean(token) }),
  setUser: (user) => set({ user }),
  setAuth: (token, user) =>
    set({ accessToken: token, user, isAuthenticated: true }),
  clearAuth: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),
}));
