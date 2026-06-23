import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/order';

interface Props {
  order: Order;
  border: string;
  onPrepare?:  () => void;
  onServe?:    () => void;
  onPayTable?: () => void;
  onCancel?:   () => void;
}

export function CashierOrderCard({ order, border, onPrepare, onServe, onPayTable, onCancel }: Props) {
  const [mins, setMins] = useState(0);

  useEffect(() => {
    const updateMins = () => {
      setMins(Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60_000));
    };

    updateMins();
    const timer = window.setInterval(updateMins, 60_000);
    return () => window.clearInterval(timer);
  }, [order.createdAt]);

  return (
    <div className={cn('rounded-xl border-2 bg-white p-3 shadow-sm', border)}>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-bold">{order.tableName} · #{order.id}</span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="size-3" />{mins === 0 ? 'vừa xong' : `${mins}p`}
        </span>
      </div>
      {order.status === 'SERVED'
        ? <p className="mb-2 text-sm text-muted-foreground">{order.items.length} món · {order.totalAmount.toLocaleString('vi-VN')}đ</p>
        : <ul className="mb-2 space-y-0.5 text-sm">{order.items.map((it, i) => (
            <li key={i}>{it.quantity}x {it.name}{it.note && <span className="ml-1 text-xs text-amber-600">✏{it.note}</span>}</li>
          ))}</ul>
      }
      <div className="flex gap-2">
        {onPrepare  && <Button size="sm" className="flex-1 bg-orange-500 text-xs text-white hover:bg-orange-600" onClick={onPrepare}>Xác nhận</Button>}
        {onServe    && <Button size="sm" className="flex-1 bg-purple-500 text-xs text-white hover:bg-purple-600" onClick={onServe}>✓ Đã phục vụ</Button>}
        {onPayTable && <Button size="sm" className="w-full bg-green-500 text-xs text-white hover:bg-green-600" onClick={onPayTable}>🔑 Thanh toán bàn này</Button>}
        {onCancel   && <Button size="sm"  variant="outline" className="border-destructive text-xs text-destructive, flex-1" onClick={onCancel}>✕ Hủy</Button>}
      </div>
    </div>
  );
}
