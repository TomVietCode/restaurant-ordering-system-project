import { auth } from '@/auth';
import { CashierBoard } from '@/components/features/cashier/cashier_order/CashierBoard';
import { orderService } from '@/services/order.service';
import { tableService } from '@/services/table.service';

export default async function CashierPage() {
  const session = await auth();
  const token   = session?.accessToken ?? null;

  const [initialOrders, tables] = await Promise.all([
    orderService.getCashierOrders(token),
    tableService.getAll(token),
  ]);

  return (
    <div className="h-full p-4">
      <CashierBoard initialOrders={initialOrders} tables={tables} token={token} />
    </div>
  );
}
