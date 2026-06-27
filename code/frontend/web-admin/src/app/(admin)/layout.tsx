import { auth } from '@/auth';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from 'next-auth/react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? null;

  return (
    <SessionProvider>
      <SidebarProvider style={{ '--sidebar-width': '240px', '--sidebar-width-icon': '56px' } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <AppHeader user={user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </SidebarInset>
        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </SessionProvider>
  );
}
