import type { ReactNode } from 'react';

/**
 * Shared layout for authenticated admin routes (Owner / Staff).
 *
 * `(admin)` is a route group — the parentheses keep it out of the URL,
 * so children resolve to `/dashboard`, `/menu`, `/orders`, etc.
 *
 * TODO: add sidebar + header and a client-side RBAC guard (FR-01.2),
 * e.g. redirect to /login when unauthenticated and hide Owner-only nav for Staff.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
