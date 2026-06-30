'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ClipboardList, UtensilsCrossed,
  QrCode, BarChart3, Users,List,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { ROUTES } from '@/lib/constants';

const NAV = [
  { label: 'Tổng quan',        href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Bảng đơn',         href: ROUTES.orders,    icon: ClipboardList   },
    { label: 'Bảng danh mục',         href: ROUTES.list,    icon: List   },
  { label: 'Quản lý menu',      href: ROUTES.menu,      icon: UtensilsCrossed },
  { label: 'Bàn & mã QR',       href: ROUTES.tables,    icon: QrCode          },
  { label: 'Báo cáo doanh thu', href: ROUTES.revenue,   icon: BarChart3       },
  { label: 'Nhân viên',         href: ROUTES.staff,     icon: Users           },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, setOpen } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      onClick={() => { if (state === 'collapsed') setOpen(true); }}
      className={state === 'collapsed' ? 'cursor-pointer' : ''}
    >
       <SidebarHeader className="px-4 py-3">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="Logo quán"
            width={50}
            height={50}
            className="shrink-0 rounded-lg object-cover"
          />
          <span className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">
            F&amp;B Admin
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarMenu>
            {NAV.map(({ label, href, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={pathname === href}
                  tooltip={label}
                  onClick={() => router.push(href)}
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:hidden p-4 text-xs text-muted-foreground">
        F&amp;B v1.0
      </SidebarFooter>
    </Sidebar>
  );
}
