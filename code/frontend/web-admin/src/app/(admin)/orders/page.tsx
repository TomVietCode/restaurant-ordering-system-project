import { Suspense } from 'react';
import { OrdersPage } from '@/components/features/orders/OrdersPage';

export default function Page() {
  return (
    <Suspense>
      <OrdersPage />
    </Suspense>
  );
}
