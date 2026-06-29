import { auth } from '@/auth';
import { AppHeader } from '@/components/layout/header';
import { CashierBoard } from '@/components/features/cashier/cashier_order/CashierBoard';
import { orderService } from '@/services/order.service';
import { tableService } from '@/services/table.service';

export default async function CashierPage() {
  const session = await auth();
  const user    = session?.user  ?? null;
  const token   = session?.accessToken ?? null;

  const [initialOrders, tables] = await Promise.all([
    orderService.getCashierOrders(token),
    tableService.getAll(token),
  ]);

  return (
    <div className="flex h-screen flex-col ">
      <AppHeader user={user} showTrigger={false} backHref="/select-role" />
      <main className="flex-1 overflow-hidden p-4">
        <CashierBoard initialOrders={initialOrders} tables={tables} token={token} />
      </main>
    </div>
  );
}
