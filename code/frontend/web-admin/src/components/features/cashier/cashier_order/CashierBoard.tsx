'use client';

import { useState } from 'react';
import { Columns, LayoutGrid } from 'lucide-react';
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

const NAV = [
  { tab: 'orders' as Tab, icon: Columns,    label: 'Đơn hàng' },
  { tab: 'tables' as Tab, icon: LayoutGrid, label: 'Bàn'      },
];

interface Props { initialOrders: Order[]; tables: Table[]; token: string | null }

export function CashierBoard({ initialOrders, tables, token }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tab,    setTab]    = useState<Tab>('orders');
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

  const sorted = (s: OrderStatus) =>
    orders.filter(o => o.status === s).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

  return (
    <div className="flex h-full gap-3">
      {/* ── Sidebar ── */}
      <aside className="flex w-44 min-w-44 flex-col rounded-xl border border-sidebar-border bg-sidebar">
        <nav className="p-2">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Thu ngân</p>
          {NAV.map(({ tab: t, icon: Icon, label }) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                tab === t
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}>
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

      </aside>

      {/* ── Nội dung chính ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
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
          />
        )}
      </div>
    </div>
  );
}
