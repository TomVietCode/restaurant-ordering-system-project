import { auth } from '@/auth';
import { AppHeader } from '@/components/layout/header';

export default async function CashierPage() {
  const session = await auth();
  const user = session?.user ?? null;

  return (
    <div className="flex h-screen flex-col">
      {/* showTrigger=false vì cashier không có sidebar → không cần SidebarProvider */}
      <AppHeader user={user} showTrigger={false} backHref="/select-role" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-h2">Thu ngân</h1>
        {/* TODO: hiển thị vé đơn cần chế biến (US-04) */}
      </main>
    </div>
  );
}
