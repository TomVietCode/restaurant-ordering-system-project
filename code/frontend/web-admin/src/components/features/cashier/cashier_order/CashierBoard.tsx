"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toViError } from "@/lib/errors";
import type { Order, OrderStatus } from "@/types/order";
import type { Table } from "@/types/table";
import { orderService } from "@/services/order.service";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import { OrderColumn } from "./OrderColumn";
import { PaymentPanel } from "./PaymentPanel";
import { TablePanel } from "../cashier_table/TablePanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tab = "orders" | "tables";
type Method = "CASH" | "TRANSFER";

/** Data for the single-order payment panel in the orders tab. */
interface Bill {
  orderId: number;
  tableId: string;
  tableName: string;
  orders: Order[];
  total: number;
}

/** Data for the cancel confirmation dialog. */
interface CancelTarget {
  id: number;
  trackingCode: string;
  tableName: string;
}

// Column definitions for the Kanban board (NEW → PREPARING → SERVED)
const COLS = [
  {
    label: "MỚI",
    status: "NEW" as OrderStatus,
    bg: "bg-status-new border-status-new-foreground/20",
    countBg: "bg-status-new-dot",
    border: "border-status-new-dot",
  },
  {
    label: "ĐANG CHUẨN BỊ",
    status: "PREPARING" as OrderStatus,
    bg: "bg-status-preparing border-status-preparing-foreground/20",
    countBg: "bg-status-preparing-dot",
    border: "border-status-preparing-dot",
  },
  {
    label: "ĐÃ PHỤC VỤ",
    status: "SERVED" as OrderStatus,
    bg: "bg-status-served border-status-served-foreground/20",
    countBg: "bg-status-served-dot",
    border: "border-status-served-dot",
  },
];

interface Props {
  initialOrders: Order[];
  tables: Table[];
  token: string | null;
}

export function CashierBoard({ initialOrders, tables, token }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab = (rawTab === "tables" ? "tables" : "orders") as Tab;

  const [bill, setBill] = useState<Bill | null>(null);
  const [method, setMethod] = useState<Method>("CASH");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Set while creating a VNPay payment URL + redirecting to the gateway.
  // Holds the order id being processed (also blocks duplicate submissions).
  const [redirectingOrderId, setRedirectingOrderId] = useState<number | null>(
    null,
  );

  // Cancel confirmation dialog state
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // ──────────────────────────────────────────────────────────
  // WebSocket: realtime order updates
  // ──────────────────────────────────────────────────────────

  /**
   * When a new order arrives via WebSocket:
   * 1. Fetch the full order data from the backend (the WS event only has the order ID).
   * 2. Add it to the local state if it's not already there (avoid duplicates).
   */
  const handleNewOrder = useCallback(
    async (data: { orderId: number }) => {
      try {
        const order = await orderService.getOrderById(token, data.orderId);
        setOrders((prev) => {
          // Prevent duplicates: if the order already exists (e.g. we created it), skip
          if (prev.some((o) => o.id === order.id)) return prev;
          return [...prev, order];
        });
      } catch (err) {
        console.error("Failed to fetch new order:", err);
      }
    },
    [token],
  );

  /**
   * When an order status changes via WebSocket:
   * - If the new status is terminal (PAID or CANCEL), remove the order from the board.
   * - Otherwise, update the order's status in local state.
   */
  const handleStatusChanged = useCallback(
    (data: { orderId: number; status: string }) => {
      if (data.status === "PAID" || data.status === "CANCEL") {
        setOrders((prev) => prev.filter((o) => o.id !== data.orderId));
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === data.orderId
              ? { ...o, status: data.status as OrderStatus }
              : o,
          ),
        );
      }
    },
    [],
  );

  // Connect to WebSocket — the hook handles subscribe/unsubscribe
  useOrderSocket({
    onNewOrder: handleNewOrder,
    onStatusChanged: handleStatusChanged,
  });

  // ──────────────────────────────────────────────────────────
  // Order status transitions (Kanban board actions)
  // ──────────────────────────────────────────────────────────

  /**
   * Move an order to a new status.
   * 1. Call the backend API first (optimistic UI could fail otherwise).
   * 2. On success, update local state.
   * 3. For terminal statuses (PAID/CANCEL), remove the order from the board.
   */
  const move = async (id: number, status: OrderStatus) => {
    try {
      await orderService.updateStatus(token, id, status);
      setOrders((prev) =>
        ["PAID", "CANCEL"].includes(status)
          ? prev.filter((o) => o.id !== id)
          : prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
    } catch (err) {
      console.error(`Failed to update order #${id} to ${status}:`, err);
      alert("Cập nhật trạng thái thất bại, vui lòng thử lại.");
    }
  };

  // ──────────────────────────────────────────────────────────
  // Payment — orders tab (single order)
  // ──────────────────────────────────────────────────────────

  /**
   * Open the payment panel for a SINGLE order.
   *
   * FIX: Previously, this function took a `tableId` and paid ALL served orders
   * for that table. Now it takes an `orderId` and pays only that specific order.
   */
  const openBill = (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status !== "SERVED") return;

    setBill({
      orderId: order.id,
      tableId: order.tableId,
      tableName: order.tableName,
      orders: [order], // Only this order, NOT all table orders
      total: order.totalAmount,
    });
    setMethod("CASH");
  };

  // ──────────────────────────────────────────────────────────
  // Payment — VNPay bank transfer (redirect, single order)
  // ──────────────────────────────────────────────────────────

  /**
   * Start a VNPay bank transfer for a single order:
   * request a signed payment URL from the backend, then redirect the browser
   * to VNPay. After payment, VNPay returns the user to `/cashier/payment-return`.
   *
   * Guarded by `redirectingOrderId` so a second click can't create a duplicate
   * payment while the request is in flight.
   */
  const startVnpay = useCallback(
    async (orderId: number) => {
      setRedirectingOrderId((cur) => cur ?? orderId);
      try {
        const url = await orderService.createVnpayPaymentUrl(token, orderId);
        window.location.href = url; // full-page redirect to the VNPay gateway
      } catch (err) {
        console.error("Failed to start VNPay payment:", err);
        setRedirectingOrderId(null);
        alert(toViError(err, "Không thể khởi tạo thanh toán chuyển khoản."));
      }
    },
    [token],
  );

  /**
   * Confirm payment for the single order shown in the payment panel.
   *
   * - CASH → mark PAID immediately via `payOrders` (single-element array).
   * - TRANSFER → redirect to the VNPay payment page.
   */
  const pay = async () => {
    if (!bill) return;

    if (method === "TRANSFER") {
      await startVnpay(bill.orderId);
      return;
    }

    try {
      await orderService.payOrders(token, bill.tableId, [bill.orderId], method);
      setOrders((prev) => prev.filter((o) => o.id !== bill.orderId));
      setBill(null);
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Thanh toán thất bại, vui lòng thử lại.");
    }
  };

  // ──────────────────────────────────────────────────────────
  // Payment — tables tab (table-wide or multi-select)
  // ──────────────────────────────────────────────────────────

  const handlePayTable = async (tableId: string, paymentMethod: Method) => {
    await orderService.payTable(token, tableId, paymentMethod);
    setOrders((prev) => prev.filter((o) => o.tableId !== tableId));
  };

  const handlePayOrders = async (
    tableId: string,
    orderIds: number[],
    paymentMethod: Method,
  ) => {
    await orderService.payOrders(token, tableId, orderIds, paymentMethod);
    setOrders((prev) => prev.filter((o) => !orderIds.includes(o.id)));
  };

  // ──────────────────────────────────────────────────────────
  // Cancel order — with confirmation dialog
  // ──────────────────────────────────────────────────────────

  /** Open the confirmation dialog (doesn't cancel yet). */
  const requestCancel = (id: number) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    setCancelTarget({
      id,
      trackingCode: order.trackingCode,
      tableName: order.tableName,
    });
    setCancelReason("");
  };

  /** User confirmed the cancel action. */
  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const trimmedReason = cancelReason.trim();
    if (!trimmedReason) {
      alert("Vui lòng nhập lý do hủy đơn.");
      return;
    }
    setCancelling(true);
    try {
      await orderService.cancelOrder(token, cancelTarget.id, trimmedReason);
      setOrders((prev) => prev.filter((o) => o.id !== cancelTarget.id));
      setCancelTarget(null);
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("Hủy đơn thất bại, vui lòng thử lại.");
    } finally {
      setCancelling(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────

  /** Filter and sort orders by status (oldest first). */
  const sorted = (s: OrderStatus) =>
    orders
      .filter((o) => o.status === s)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

  // ──────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {tab === "orders" && (
        <div
          className={cn(
            "grid flex-1 gap-3 overflow-hidden",
            bill ? "grid-cols-4" : "grid-cols-3",
          )}
        >
          {COLS.map((c) => (
            <OrderColumn
              key={c.status}
              {...c}
              orders={sorted(c.status)}
              onPrepare={
                c.status === "NEW" ? (id) => move(id, "PREPARING") : undefined
              }
              onPay={
                c.status === "SERVED"
                  ? (orderId) => openBill(orderId)
                  : undefined
              }
              onCancel={
                c.status !== "SERVED" ? (id) => requestCancel(id) : undefined
              }
            />
          ))}
          {bill && (
            <PaymentPanel
              tableName={bill.tableName}
              orders={bill.orders}
              total={bill.total}
              method={method}
              onMethod={setMethod}
              onConfirm={pay}
              onClose={() => setBill(null)}
              processing={redirectingOrderId !== null}
            />
          )}
        </div>
      )}

      {tab === "tables" && (
        <TablePanel
          tables={tables}
          orders={orders}
          selectedTableId={selectedTableId}
          onSelectTable={setSelectedTableId}
          onPayTable={handlePayTable}
          onPayOrders={handlePayOrders}
          onVnpayOrder={startVnpay}
        />
      )}

      {/* ── Redirecting to VNPay: full-screen loading overlay ── */}
      {redirectingOrderId !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
          <Loader2 className="size-8 animate-spin text-zinc-700" />
          <p className="text-sm font-medium text-muted-foreground">
            Đang chuyển đến cổng thanh toán VNPay...
          </p>
        </div>
      )}

      {/* ── Cancel Order Confirmation Dialog ── */}
      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy đơn</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn hủy đơn{" "}
              <strong>#{cancelTarget?.trackingCode}</strong> (
              {cancelTarget?.tableName})?
            </DialogDescription>
          </DialogHeader>
          <div className="my-3 space-y-2">
            <label
              htmlFor="cancel-reason"
              className="text-sm font-medium text-slate-700"
            >
              Lý do hủy <span className="text-destructive">*</span>
            </label>
            <Input
              id="cancel-reason"
              placeholder="Nhập lý do hủy đơn..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={cancelling}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelTarget(null)}
              disabled={cancelling}
            >
              Không, giữ lại
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmCancel}
              disabled={cancelling || !cancelReason.trim()}
            >
              {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
