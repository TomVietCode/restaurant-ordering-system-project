import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CashierBoard } from '@/components/features/cashier/cashier_order/CashierBoard';
import { orderService } from '@/services/order.service';
import { tableService } from '@/services/table.service';
import { ApiError } from '@/lib/api';

export default async function CashierPage() {
  const session = await auth();
  const token = session?.accessToken ?? null;

  let initialOrders, tables;
  try {
    [initialOrders, tables] = await Promise.all([
      orderService.getCashierOrders(token),
      tableService.getAll(token),
    ]);
  } catch (err) {
    // Tài khoản bị khóa / token bị thu hồi giữa phiên → về trang đăng nhập
    if (err instanceof ApiError && err.status === 401) redirect('/login?error=locked');
    throw err;
  }

  return (
    <div className="h-full p-4">
      <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Đang tải bảng thu ngân...</div>}>
        <CashierBoard initialOrders={initialOrders} tables={tables} token={token} />
      </Suspense>
    </div>
  );
}
