"use client";

import { Button } from "@/components/ui/button";
import type { Order } from "@/types/order";

interface Props {
  order: Order;
  onDone: () => void;
}

export function OrderCard({ order, onDone }: Props) {
  // Gộp món trùng tên + note, cộng số lượng
  const mergedItems = order.items.reduce<typeof order.items>((acc, item) => {
    const found = acc.find(
      (i) => i.name === item.name && (i.note ?? "") === (item.note ?? ""),
    );
    if (found) found.quantity += item.quantity;
    else acc.push({ ...item });
    return acc;
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-border bg-background shadow-sm">
      {/* Header part with original background color */}
      <div className="bg-status-preparing p-4 flex items-start justify-between gap-2 border-b border-border">
        <div>
          <p className="text-2xl font-black tracking-wide text-zinc-900">{order.tableName}</p>
        </div>
        <span className="text-xs text-kitchen-muted font-medium">
          {"#"}
          {order.trackingCode}
        </span>
      </div>

      {/* Body part with light background color */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
        <ul className="mb-4 min-h-0 flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
          {mergedItems.map((item, i) => (
            <li key={i} className="rounded-lg bg-white border border-zinc-200/80 px-3 py-2 text-lg">
              <span className="font-semibold text-kitchen-text-primary">
                {item.quantity} × {item.name}
              </span>
              {item.note && (
                <p className="mt-0.5 text-xs text-kitchen-text-secondary">
                  Ghi chú: {item.note}
                </p>
              )}
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
    </div>
  );
}
