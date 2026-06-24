import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const role = req.auth?.user?.role;

  // Chưa đăng nhập → về /login
  if (!req.auth && nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  const ownerOnly = ['/dashboard', '/menu', '/tables', '/orders', '/revenue', '/staffs'];
  const staffOnly = ['/select-role', '/kitchen', '/cashier'];

  // STAFF cố vào route của OWNER → về /select-role
  if (role === 'STAFF' && ownerOnly.some((p) => nextUrl.pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/select-role', nextUrl));
  }

  // OWNER cố vào route của STAFF → về /dashboard
  if (role === 'OWNER' && staffOnly.some((p) => nextUrl.pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
