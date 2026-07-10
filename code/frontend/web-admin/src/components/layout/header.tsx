'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { User, LogOut, ChevronLeft, Key, Monitor, LayoutDashboard } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/orders':    'Bảng đơn',
  '/menu':      'Quản lý menu',
  '/tables':    'Bàn & mã QR',
  '/revenue':   'Báo cáo doanh thu',
  '/staffs':    'Nhân viên',
  '/kitchen':   'Màn hình Bếp',
  '/cashier':   'Thu ngân',
  '/select-role': 'Chọn phân hệ',
  '/profile':   'Thông tin tài khoản',
};

const roleLabel: Record<string, string> = {
  OWNER: 'Chủ quán',
  STAFF: 'Nhân viên',
};

interface UserInfo {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export function AppHeader({
  user,
  showTrigger = true,
  backHref,
}: {
  user: UserInfo | null;
  showTrigger?: boolean;
  backHref?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') ?? 'orders';

  const title = pageTitles[pathname] ?? 'Trang quản lý';
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'A';
  
  const derivedBackHref = backHref ?? (['/kitchen', '/cashier'].includes(pathname) ? '/select-role' : undefined);

  const isStaffPage = ['/kitchen', '/cashier', '/select-role'].includes(pathname);
  const isOwner = user?.role === 'OWNER';

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b bg-primary-foreground px-4">
      <div className="flex items-center gap-2">
        {showTrigger && <SidebarTrigger />}
        {derivedBackHref && (
          <Link
            href={derivedBackHref}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Quay lại"
          >
            <ChevronLeft className="size-4" />
          </Link>
        )}
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>

      {pathname === '/cashier' && (
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => router.push('/cashier?tab=orders')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border-0 outline-none',
              tab === 'orders'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Đơn hàng
          </button>
          <button
            onClick={() => router.push('/cashier?tab=tables')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border-0 outline-none',
              tab === 'tables'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Danh sách bàn
          </button>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground hover:bg-muted/80 focus:outline-none"
          aria-label="Tài khoản"
        >
          {initial}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{user?.name ?? 'Admin'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</p>
            {user?.role && (
              <p className="text-xs text-muted-foreground">
                {roleLabel[user.role] ?? user.role}
              </p>
            )}
          </div>
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => router.push(isStaffPage ? '/dashboard' : '/select-role')}
              >
                {isStaffPage ? (
                  <><LayoutDashboard className="size-4" />Vào màn hình quản trị</>
                ) : (
                  <><Monitor className="size-4" />Vào màn hình nhân viên</>
                )}
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => router.push('/profile')}>
            <User className="size-4" />
            Thông tin tài khoản
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => router.push('/profile?action=change-password')}>
            <Key className="size-4" />
            Đổi mật khẩu
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = '/login';
            }}
          >
            <LogOut className="size-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
