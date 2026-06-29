import { auth } from '@/auth';
import Image from 'next/image';
import { AppHeader } from '@/components/layout/header';
import { KitchenBoard } from '@/components/features/kitchen/KitchenBoard';
import { orderService } from '@/services/order.service';

export default async function KitchenPage() {
  const session = await auth();
  const user = session?.user ?? null;
  const token = session?.accessToken ?? null;
  // Gọi lấy data
  const initialOrders = await orderService.getKitchenOrders(token);

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader user={user} showTrigger={false} backHref="/select-role" />
      <main className="flex-1 overflow-hidden p-4">
        {/* <p> Truyền xuống component</p> */}
        <KitchenBoard initialOrders={initialOrders} token={token} />
      </main>
    </div>
  );
}
