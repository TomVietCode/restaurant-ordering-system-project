import { Role } from '@/types/auth';

/** Backend API base URL (NestJS, includes the `/api` prefix). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/** Web Admin route paths. */
export const ROUTES = {
  login: '/', // trang đăng nhập = trang chủ (nhóm (auth))
  dashboard: '/dashboard',
  menu: '/menu',
  tables: '/tables',
  orders: '/orders',
  revenue: '/revenue',
  staff: '/staffs',
  kitchen: '/kitchen',
  cashier: '/cashier',
  select: '/select-role',
} as const;

/** Backend auth endpoints (relative to `API_BASE_URL`). */
export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  profile: '/auth/profile',
} as const;

/** Landing route per role after a successful login (FR-01.1). */
export const ROLE_HOME: Record<Role, string> = {
  [Role.OWNER]: ROUTES.dashboard,
  [Role.STAFF]: ROUTES.select, // staff phải chọn vai trò (bếp hoặc thu ngân) sau khi đăng nhập
};
