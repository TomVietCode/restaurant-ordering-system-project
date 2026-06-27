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
}

export function TablePanel({ tables, orders, selectedTableId, onSelectTable }: Props) {
  const rows = enrich(tables, orders);
  const selected = rows.find(r => r.id === selectedTableId) ?? null;

  return (
    <div className="flex flex-1 overflow-hidden rounded-xl border border-border">
      <TableList rows={rows} selectedId={selectedTableId} onSelect={onSelectTable} />
      <TableDetail selected={selected} />
    </div>
  );
}
