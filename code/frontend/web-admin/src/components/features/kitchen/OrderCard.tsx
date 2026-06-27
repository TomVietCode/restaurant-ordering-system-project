'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types/order';

interface Props {
  order: Order;
  onDone: () => void;
}

export function OrderCard({ order, onDone }: Props) {
  const [mins, setMins] = useState(0);

  useEffect(() => {
    const update = () =>
      setMins(Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60_000));
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, [order.createdAt]);

  // Gộp món trùng tên + note, cộng số lượng
  const mergedItems = order.items.reduce<typeof order.items>((acc, item) => {
    const found = acc.find(i => i.name === item.name && (i.note ?? '') === (item.note ?? ''));
    if (found) found.quantity += item.quantity;
    else acc.push({ ...item });
    return acc;
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-red-300 p-4 bg-kitchen-card shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-black tracking-wide">{order.tableName}</p>
          <p className="flex items-center gap-1 text-xs text-kitchen-muted">
            <Clock className="size-3" />
            {mins === 0 ? 'vừa xong' : `${mins} phút trước`}
          </p>
        </div>
        <span className="text-xs text-kitchen-muted">
          #DH-{String(order.id).padStart(4, '0')}
        </span>
      </div>

      <ul className="mb-4 min-h-0 flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
        {mergedItems.map((item, i) => (
          <li key={i} className="rounded-lg bg-white/30 px-3 py-2 text-lg">
            <span className="font-semibold text-kitchen-text-primary">{item.quantity} × {item.name}</span>
            {item.note && <p className="mt-0.5 text-xs text-kitchen-text-secondary">Ghi chú: {item.note}</p>}
          </li>
        ))}
      </ul>

      <Button
        className="w-full h-12 bg-emerald-500 font-bold text-white hover:bg-emerald-600 uppercase text-base"
        onClick={onDone}
      >
        Hoàn thành
      </Button>
    </div>
  );
}
