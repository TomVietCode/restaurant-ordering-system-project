import { auth } from '@/auth';
import { AppHeader } from '@/components/layout/header';

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user ?? null;

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader user={user} showTrigger={false} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
