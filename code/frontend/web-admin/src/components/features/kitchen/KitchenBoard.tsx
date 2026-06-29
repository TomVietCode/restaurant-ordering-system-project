'use client';

import { useEffect, useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { io } from 'socket.io-client';
import type { Order } from '@/types/order';
import { orderService } from '@/services/order.service';
import { OrderCard } from './OrderCard';

interface Props { initialOrders: Order[]; token: string | null }

export function KitchenBoard({ initialOrders, token }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const handleDone = async (id: number) => {
    await orderService.updateStatus(token, id, 'SERVED');
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const visible = orders
    .filter(o => o.status === 'NEW')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const displayed    = visible.slice(0, 8);
  const placeholders = displayed.length === 0 ? 0 : 8 - displayed.length;

  return (
    <div className="grid h-full grid-cols-4 grid-rows-2 gap-3">
      {visible.length === 0 ? (
        <div className="col-span-4 row-span-2 flex flex-col items-center justify-center text-kitchen-muted">
          <CheckCheck className="mb-3 size-10 opacity-40" />
          <p className="text-lg">Không có đơn nào cần làm</p>
        </div>
      ) : (
        <>
          {displayed.map(order => (
            <OrderCard key={order.id} order={order} onDone={() => handleDone(order.id)} />
          ))}
          {Array.from({ length: placeholders }).map((_, i) => (
            <div key={`ph-${i}`}
              className="flex items-center justify-center rounded-2xl border border-dashed border-orange-500 text-sm text-kitchen-muted">
              [ vé tiếp theo... ]
            </div>
          ))}
        </>
      )}
    </div>
  );
}
