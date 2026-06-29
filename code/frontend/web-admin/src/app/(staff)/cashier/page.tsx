import { Suspense } from 'react';
import { auth } from '@/auth';
import { CashierBoard } from '@/components/features/cashier/cashier_order/CashierBoard';
import { orderService } from '@/services/order.service';
import { tableService } from '@/services/table.service';

export default async function CashierPage() {
  const session = await auth();
  const token = session?.accessToken ?? null;

  const [initialOrders, tables] = await Promise.all([
    orderService.getCashierOrders(token),
    tableService.getAll(token),
  ]);

  return (
    <div className="h-full p-4">
      <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Đang tải bảng thu ngân...</div>}>
        <CashierBoard initialOrders={initialOrders} tables={tables} token={token} />
      </Suspense>
    </div>
  );
}
