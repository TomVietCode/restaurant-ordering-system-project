import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import type { LoginPayload, User } from '@/types';

/**
 * Thin convenience hook wiring the auth store to the auth service.
 * Components read `user`/`isAuthenticated` and call `login`/`logout`.
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const login = async (payload: LoginPayload): Promise<User> => {
    const { accessToken: token } = await authService.login(payload);
    // Set the token first so the profile request below is authenticated.
    useAuthStore.getState().setAccessToken(token);
    const profile = await authService.getProfile();
    setAuth(token, profile);
    return profile;
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };

  return { user, accessToken, isAuthenticated, login, logout };
}
