import type { Order } from '@/types/order';
import type { Table } from '@/types/table';
import { TableList } from './TableList';
import { TableDetail } from './TableDetail';

export type TblStatus = 'WAITPAY' | 'SERVING' | 'EMPTY';

export interface Row extends Table {
  tblStatus: TblStatus;
  active: Order[];
  total: number;
}

function enrich(tables: Table[], orders: Order[]): Row[] {
  return tables.map(t => {
    const active = orders.filter(o => o.tableId === t.id);
    const tblStatus: TblStatus = !active.length ? 'EMPTY' : active.some(o => o.status === 'SERVED') ? 'WAITPAY' : 'SERVING';
    return { ...t, tblStatus, active, total: active.reduce((s, o) => s + o.totalAmount, 0) };
  });
}

interface Props {
  tables: Table[];
  orders: Order[];
  selectedTableId: string | null;
  onSelectTable: (id: string) => void;
  onPayTable: (tableId: string, paymentMethod: 'CASH' | 'TRANSFER') => Promise<void>;
  onPayOrders: (tableId: string, orderIds: number[], paymentMethod: 'CASH' | 'TRANSFER') => Promise<void>;
}

export function TablePanel({ tables, orders, selectedTableId, onSelectTable, onPayTable, onPayOrders }: Props) {
  const rows = enrich(tables, orders);
  const selected = rows.find(r => r.id === selectedTableId) ?? null;

  return (
    <div className="flex flex-1 overflow-hidden rounded-xl border border-border">
      <TableList rows={rows} selectedId={selectedTableId} onSelect={onSelectTable} />
      <TableDetail selected={selected} onPayTable={onPayTable} onPayOrders={onPayOrders} />
    </div>
  );
}
