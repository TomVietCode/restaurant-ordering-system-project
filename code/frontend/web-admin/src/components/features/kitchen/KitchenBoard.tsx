"use client";

import { useState, useCallback } from "react";
import type { Order } from "@/types/order";
import { orderService } from "@/services/order.service";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import { OrderCard } from "./OrderCard";

interface Props {
  initialOrders: Order[];
  token: string | null;
}

export function KitchenBoard({ initialOrders, token }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const handleDone = async (id: number) => {
    await orderService.updateStatus(token, id, "SERVED");
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // Listen for real-time status updates via Socket.IO
  const handleStatusChanged = useCallback(
    async (data: { orderId: number; status: string }) => {
      if (data.status === "PREPARING") {
        try {
          const order = await orderService.getOrderById(token, data.orderId);
          setOrders((prev) => {
            if (prev.some((o) => o.id === order.id)) return prev;
            return [...prev, order];
          });
        } catch (err) {
          console.error("Failed to fetch updated kitchen order:", err);
        }
      } else {
        // If order transitions to SERVED, PAID, CANCEL, remove it from the board
        setOrders((prev) => prev.filter((o) => o.id !== data.orderId));
      }
    },
    [token],
  );

  useOrderSocket({
    onStatusChanged: handleStatusChanged,
  });

  const visible = orders
    .filter((o) => o.status === "PREPARING")
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  const displayed = visible.slice(0, 8);
  const placeholders = 8 - displayed.length;

  return (
    <div className="grid h-full grid-cols-4 grid-rows-2 gap-3">
      <>
        {displayed.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onDone={() => handleDone(order.id)}
          />
        ))}
        {Array.from({ length: placeholders }).map((_, i) => (
          <div
            key={`ph-${i}`}
            className="flex items-center justify-center rounded-2xl border border-dashed border-red-300 text-sm text-kitchen-muted"
          ></div>
        ))}
      </>
    </div>
  );
}
