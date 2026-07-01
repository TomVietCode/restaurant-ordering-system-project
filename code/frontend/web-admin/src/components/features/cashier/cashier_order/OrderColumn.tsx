import { cn } from '@/lib/utils';
import type { Order } from '@/types/order';
import { CashierOrderCard } from './CashierOrderCard';

interface Props {
  label: string;
  bg: string; countBg: string; border: string;
  orders: Order[];
  onPrepare?: (id: number) => void;
  onPay?: (orderId: number) => void;
  onCancel?: (id: number) => void;
}

export function OrderColumn({ label, bg, countBg, border, orders, onPrepare, onPay, onCancel }: Props) {
  return (
    <div className={cn('flex h-[calc(100vh-90px)] flex-col rounded-xl border p-3', bg)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold">
          {label}
        </h2>

        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-bold text-white',
            countBg
          )}
        >
          {orders.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <CashierOrderCard
              key={o.id}
              order={o}
              border={border}
              onPrepare={onPrepare ? () => onPrepare(o.id) : undefined}
              onPay={onPay ? () => onPay(o.id) : undefined}
              onCancel={onCancel ? () => onCancel(o.id) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
