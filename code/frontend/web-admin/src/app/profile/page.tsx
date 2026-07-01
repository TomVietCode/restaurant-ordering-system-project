import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from 'next-auth/react';
import { authService } from '@/services/auth.service';
import { ProfileForm } from '@/components/features/profile/profile-form';
import React from 'react';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.accessToken) {
    redirect('/login');
  }

  const user = session.user;
  const token = session.accessToken;

  // Pre-fetch profile server-side
  let profile;
  try {
    profile = await authService.getProfile(token);
  } catch (error) {
    console.error('Failed to fetch profile', error);
    // If fetching profile fails (e.g. invalid/expired token), redirect to login
    redirect('/login');
  }

  const isOwner = user.role === 'OWNER';

  if (isOwner) {
    return (
      <SessionProvider>
        <SidebarProvider style={{ '--sidebar-width': '240px', '--sidebar-width-icon': '56px' } as React.CSSProperties}>
          <AppSidebar />
          <SidebarInset>
            <AppHeader user={user} />
            <main className="flex-1 overflow-y-auto p-6">
              <ProfileForm initialProfile={profile} token={token} />
            </main>
          </SidebarInset>
          <Toaster position="bottom-right" />
        </SidebarProvider>
      </SessionProvider>
    );
  }

  // Staff Layout (no sidebar, just header)
  return (
    <SessionProvider>
      <div className="flex h-screen flex-col bg-background">
        <AppHeader user={user} showTrigger={false} />
        <main className="flex-1 overflow-y-auto p-6">
          <ProfileForm initialProfile={profile} token={token} />
        </main>
        <Toaster position="bottom-right" />
      </div>
    </SessionProvider>
  );
}
