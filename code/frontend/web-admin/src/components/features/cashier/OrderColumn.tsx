import { cn } from '@/lib/utils';
import type { Order } from '@/types/order';
import { CashierOrderCard } from './CashierOrderCard';

interface Props {
  step: string; label: string;
  bg: string; countBg: string; border: string;
  orders: Order[];
  onPrepare?:  (id: number) => void;
  onServe?:    (id: number) => void;
  onPayTable?: (tableId: string) => void;
  onCancel?:   (id: number) => void;
}

export function OrderColumn({ step, label, bg, countBg, border, orders, onPrepare, onServe, onPayTable, onCancel }: Props) {
  return (
    <div className={cn('flex flex-col rounded-xl border p-3', bg)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold">{step} {label}</h2>
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold text-white', countBg)}>{orders.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {orders.map(o => (
          <CashierOrderCard key={o.id} order={o} border={border}
            onPrepare={onPrepare  ? () => onPrepare(o.id)       : undefined}
            onServe={onServe      ? () => onServe(o.id)         : undefined}
            onPayTable={onPayTable? () => onPayTable(o.tableId) : undefined}
            onCancel={onCancel    ? () => onCancel(o.id)        : undefined} />
        ))}
        {orders.length === 0 && <p className="py-8 text-center text-xs text-muted-foreground">[ đơn tiếp theo... ]</p>}
      </div>
    </div>
  );
}
