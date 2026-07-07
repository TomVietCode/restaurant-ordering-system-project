import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { KitchenBoard } from '@/components/features/kitchen/KitchenBoard';
import { orderService } from '@/services/order.service';
import { ApiError } from '@/lib/api';

export default async function KitchenPage() {
  const session = await auth();
  const token = session?.accessToken ?? null;
  // Gọi lấy data
  let initialOrders;
  try {
    initialOrders = await orderService.getKitchenOrders(token);
  } catch (err) {
    // Tài khoản bị khóa / token bị thu hồi giữa phiên → về trang đăng nhập
    if (err instanceof ApiError && err.status === 401) redirect('/login?error=locked');
    throw err;
  }

  return (
    <div className="h-full p-4">
      <KitchenBoard initialOrders={initialOrders} token={token} />
    </div>
  );
}
