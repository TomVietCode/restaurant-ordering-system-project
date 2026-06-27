'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User, LogOut, ChevronLeft } from 'lucide-react';
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
  const baseTitle = pageTitles[pathname] ?? 'Trang quản lý';
  const title = pathname === '/dashboard' ? `${baseTitle} — Hôm nay` : baseTitle;
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'A';
  
  const derivedBackHref = backHref ?? (['/kitchen', '/cashier'].includes(pathname) ? '/select-role' : undefined);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-primary-foreground px-4">
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
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => alert('Chức năng xem hồ sơ đang được phát triển')}>
            <User className="size-4" />
            функция размещения в разработке
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="size-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
