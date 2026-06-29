'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types/order';
import type { Table } from '@/types/table';
import { orderService } from '@/services/order.service';
import { OrderColumn } from './OrderColumn';
import { PaymentPanel } from './PaymentPanel';
import { TablePanel } from '../cashier_table/TablePanel';

type Tab    = 'orders' | 'tables';
type Method = 'CASH' | 'TRANSFER';
interface Bill { tableId: string; tableName: string; orders: Order[]; total: number }

const COLS = [
  { step: '①', label: 'MỚI',           status: 'NEW'       as OrderStatus, bg: 'bg-status-new border-status-new-foreground/20',           countBg: 'bg-status-new-dot',        border: 'border-status-new-dot'        },
  { step: '②', label: 'ĐANG CHUẨN BỊ', status: 'PREPARING' as OrderStatus, bg: 'bg-status-preparing border-status-preparing-foreground/20', countBg: 'bg-status-preparing-dot',  border: 'border-status-preparing-dot'  },
  { step: '③', label: 'ĐÃ PHỤC VỤ',    status: 'SERVED'    as OrderStatus, bg: 'bg-status-served border-status-served-foreground/20',       countBg: 'bg-status-served-dot',     border: 'border-status-served-dot'     },
];

// NAV moved to header

interface Props { initialOrders: Order[]; tables: Table[]; token: string | null }

export function CashierBoard({ initialOrders, tables, token }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const tab = (rawTab === 'tables' ? 'tables' : 'orders') as Tab;
  const [bill,   setBill]   = useState<Bill | null>(null);
  const [method, setMethod] = useState<Method>('CASH');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const move = (id: number, status: OrderStatus) =>
    setOrders(p => ['PAID', 'CANCEL'].includes(status)
      ? p.filter(o => o.id !== id)
      : p.map(o => o.id === id ? { ...o, status } : o));

  const openBill = (tableId: string) => {
    const served = orders.filter(o => o.tableId === tableId && o.status === 'SERVED');
    if (served.length) setBill({
      tableId,
      tableName: served[0].tableName,
      orders: served,
      total: served.reduce((s, o) => s + o.totalAmount, 0),
    });
    setMethod('CASH');
  };

  const pay = async () => {
    if (!bill) return;
    await orderService.payTable(token, bill.tableId, method);
    setOrders(p => p.filter(o => o.tableId !== bill.tableId));
    setBill(null);
  };

  const handlePayTable = async (tableId: string, paymentMethod: Method) => {
    await orderService.payTable(token, tableId, paymentMethod);
    setOrders(p => p.filter(o => o.tableId !== tableId));
  };

  const handlePayOrders = async (tableId: string, orderIds: number[], paymentMethod: Method) => {
    await orderService.payOrders(token, tableId, orderIds, paymentMethod);
    setOrders(p => p.filter(o => !orderIds.includes(o.id)));
  };

  const sorted = (s: OrderStatus) =>
    orders.filter(o => o.status === s).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

  return (
    <div className="flex h-full flex-col overflow-hidden">
        {tab === 'orders' && (
          
          <div className={cn('grid flex-1 gap-3 overflow-hidden', bill ? 'grid-cols-4' : 'grid-cols-3')}>
            {COLS.map(c => (
              <OrderColumn key={c.status} {...c} orders={sorted(c.status)}
                onPrepare={ c.status === 'NEW'       ? id      => move(id, 'PREPARING') : undefined}
                onServe={   c.status === 'PREPARING'  ? id      => move(id, 'SERVED')    : undefined}
                onPayTable={c.status === 'SERVED'     ? tableId => openBill(tableId)     : undefined}
                onCancel={  c.status !== 'SERVED'     ? id      => move(id, 'CANCEL')    : undefined}
              />
            ))}
            {bill && (
              <PaymentPanel tableName={bill.tableName} orders={bill.orders} total={bill.total}
                method={method} onMethod={setMethod} onConfirm={pay} onClose={() => setBill(null)} />
            )}
          </div>
        )}

        {tab === 'tables' && (
          <TablePanel
            tables={tables} orders={orders}
            selectedTableId={selectedTableId} onSelectTable={setSelectedTableId}
            onPayTable={handlePayTable}
            onPayOrders={handlePayOrders}
          />
        )}
    </div>
  );
}
