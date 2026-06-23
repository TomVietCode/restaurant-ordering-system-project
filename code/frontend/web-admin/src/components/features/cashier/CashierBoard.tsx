'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { io } from 'socket.io-client'; // TODO: bật khi backend có orders module
import type { Order, OrderStatus } from '@/types/order';
import { orderService } from '@/services/order.service';
import { OrderColumn } from './OrderColumn';
import { PaymentPanel } from './PaymentPanel';

type Method = 'CASH' | 'TRANSFER';
interface Bill { tableId: string; tableName: string; orders: Order[]; total: number }

const COLS = [
  { step: '①', label: 'MỚI',                         status: 'NEW'       as OrderStatus, bg: 'bg-blue-50 border-blue-200',     countBg: 'bg-blue-500',   border: 'border-blue-400'   },
  { step: '②', label: 'ĐANG CHUẨN BỊ',               status: 'PREPARING' as OrderStatus, bg: 'bg-amber-50 border-amber-200',   countBg: 'bg-amber-500',  border: 'border-amber-400'  },
  { step: '③', label: 'ĐÃ PHỤC VỤ — chờ thanh toán', status: 'SERVED'    as OrderStatus, bg: 'bg-purple-50 border-purple-200', countBg: 'bg-purple-500', border: 'border-purple-400' },
];

export function CashierBoard({ initialOrders, token }: { initialOrders: Order[]; token: string | null }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [bill, setBill]     = useState<Bill | null>(null);
  const [method, setMethod] = useState<Method>('CASH');

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('order:new', (order: Order) => {
      setOrders(prev => [...prev, order]);
    });

    socket.on('order:status-changed', (order: Order) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    });

    return () => { socket.disconnect(); };
  }, []);

  const move = (id: number, status: OrderStatus) =>
    setOrders(p => ['PAID', 'CANCEL'].includes(status)
      ? p.filter(o => o.id !== id)
      : p.map(o => o.id === id ? { ...o, status } : o));

  const selectTable = (tableId: string) => {
    const list = orders.filter(o => o.tableId === tableId && o.status === 'SERVED');
    if (list.length) setBill({ tableId, tableName: list[0].tableName, orders: list, total: list.reduce((s, o) => s + o.totalAmount, 0) });
    setMethod('CASH');
  };

  const pay = async () => {
    if (!bill) return;
    await orderService.payTable(token, bill.tableId, method);
    setOrders(p => p.filter(o => o.tableId !== bill.tableId));
    setBill(null);
  };

  const sorted = (status: OrderStatus) =>
    orders.filter(o => o.status === status).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="flex h-full flex-col gap-3">
      <div className={cn('grid flex-1 gap-3 overflow-hidden', bill ? 'grid-cols-4' : 'grid-cols-3')}>
        {COLS.map(c => (
          <OrderColumn key={c.status} {...c} orders={sorted(c.status)}
            onPrepare={c.status === 'NEW'       ? id => move(id, 'PREPARING') : undefined}
            onServe={c.status === 'PREPARING'   ? id => move(id, 'SERVED')    : undefined}
            onPayTable={c.status === 'SERVED'   ? selectTable                 : undefined}
            onCancel={c.status !== 'SERVED'     ? id => move(id, 'CANCEL')    : undefined} />
        ))}
        {bill && <PaymentPanel tableName={bill.tableName} orders={bill.orders} total={bill.total}
          method={method} onMethod={setMethod} onConfirm={pay} onClose={() => setBill(null)} />}
      </div>
    </div>
  );
}
