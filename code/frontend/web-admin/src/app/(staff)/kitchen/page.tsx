import { auth } from '@/auth';
import { KitchenBoard } from '@/components/features/kitchen/KitchenBoard';
import { orderService } from '@/services/order.service';

export default async function KitchenPage() {
  const session = await auth();
  const token = session?.accessToken ?? null;
  // Gọi lấy data
  const initialOrders = await orderService.getKitchenOrders(token);

  return (
    <div className="h-full p-4">
      <KitchenBoard initialOrders={initialOrders} token={token} />
    </div>
  );
}
