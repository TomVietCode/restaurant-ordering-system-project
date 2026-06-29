import { useState, useEffect } from "react";
import { Armchair, Banknote, QrCode, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";
import type { Row, TblStatus } from "./TablePanel";

const TBL_LABEL: Record<TblStatus, string> = {
  WAITPAY: "Chờ TT",
  SERVING: "Phục vụ",
  EMPTY: "Trống",
};
const TBL_BADGE: Record<TblStatus, string> = {
  WAITPAY: "bg-status-paid text-status-paid-foreground",
  SERVING: "bg-status-preparing text-status-preparing-foreground",
  EMPTY: "bg-muted text-muted-foreground",
};
const ORDER_LABEL: Record<OrderStatus, string> = {
  NEW: "Mới",
  PREPARING: "Đang làm",
  SERVED: "Đã phục vụ",
  PAID: "Đã TT",
  CANCEL: "Đã hủy",
};
const ORDER_BADGE: Record<OrderStatus, string> = {
  NEW: "bg-status-new text-status-new-foreground",
  PREPARING: "bg-status-preparing text-status-preparing-foreground",
  SERVED: "bg-status-served text-status-served-foreground",
  PAID: "bg-status-paid text-status-paid-foreground",
  CANCEL: "bg-status-cancel text-status-cancel-foreground",
};

export function TableDetail({
  selected,
  onPayTable,
  onPayOrders,
}: {
  selected: Row | null;
  onPayTable: (
    tableId: string,
    paymentMethod: "CASH" | "TRANSFER",
  ) => Promise<void>;
  onPayOrders: (
    tableId: string,
    orderIds: number[],
    paymentMethod: "CASH" | "TRANSFER",
  ) => Promise<void>;
}) {
  const [checkoutTarget, setCheckoutTarget] = useState<{
    type: "TABLE" | "ORDER" | "SELECTED_ORDERS";
    orderId?: number;
    orderIds?: number[];
    total: number;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">(
    "CASH",
  );
  const [loading, setLoading] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  const toggleSelectOrder = (id: number) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (!selected) {
    return (
      <div className="flex flex-2 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Armchair className="size-8" strokeWidth={1.5} />
        <p className="text-sm">Chọn bàn để xem chi tiết</p>
      </div>
    );
  }

  const sorted = [...selected.active].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
  );

  const selectedTotal = sorted
    .filter((o) => selectedOrderIds.includes(o.id))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handleConfirmCheckout = async () => {
    if (!checkoutTarget) return;
    setLoading(true);
    try {
      if (checkoutTarget.type === "TABLE") {
        await onPayTable(selected.id, paymentMethod);
      } else if (
        checkoutTarget.type === "ORDER" &&
        checkoutTarget.orderId !== undefined
      ) {
        await onPayOrders(selected.id, [checkoutTarget.orderId], paymentMethod);
      } else if (
        checkoutTarget.type === "SELECTED_ORDERS" &&
        checkoutTarget.orderIds !== undefined
      ) {
        await onPayOrders(selected.id, checkoutTarget.orderIds, paymentMethod);
      }
      setCheckoutTarget(null);
      setSelectedOrderIds([]);
    } catch (err) {
      console.error(err);
      alert("Thanh toán thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-2 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="font-semibold">{selected.name}</p>
          <p className="text-xs text-muted-foreground">
            {selected.active.length
              ? `${selected.active.length} đơn`
              : "Không có đơn"}
            {selected.capacity ? ` · ${selected.capacity} chỗ` : ""}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            TBL_BADGE[selected.tblStatus],
          )}
        >
          {TBL_LABEL[selected.tblStatus]}
        </span>
      </div>

      {/* Danh sách đơn */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Armchair className="size-6" strokeWidth={1.5} />
            <p className="text-xs">Bàn đang trống</p>
          </div>
        ) : (
          sorted.map((o) => {
            return (
              <div
                key={o.id}
                className="overflow-hidden rounded-lg border border-border bg-white shadow-xs"
              >
                <div
                  className="flex items-center justify-between bg-secondary/50 px-3 py-1.5 border-b border-border cursor-pointer select-none"
                  onClick={() => toggleSelectOrder(o.id)}
                >
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(o.id)}
                      onChange={() => toggleSelectOrder(o.id)}
                      className="size-4 rounded border-gray-350 text-zinc-950 focus:ring-zinc-900 cursor-pointer"
                    />
                    <span
                      className="text-xs font-semibold"
                      onClick={() => toggleSelectOrder(o.id)}
                    >
                      #{o.trackingCode}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        ORDER_BADGE[o.status],
                      )}
                    >
                      {ORDER_LABEL[o.status]}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <table className="w-full text-sm border-collapse text-left">
                    <thead>
                      <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        <th className="py-1 px-1 font-semibold text-left">
                          Tên món
                        </th>
                        <th className="py-1 px-1 font-semibold text-right w-[70px]">
                          Đơn giá
                        </th>
                        <th className="py-1 px-1 font-semibold text-center w-[100px]">
                          Số lượng
                        </th>
                        <th className="py-1 px-1 font-semibold text-right w-[85px]">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {o.items.map((it, i) => (
                        <tr
                          key={i}
                          className="text-zinc-800 hover:bg-zinc-50/50"
                        >
                          <td className="py-1.5 px-1 pr-2 max-w-[140px] truncate font-medium">
                            {it.name}
                            {it.note && (
                              <span className="text-zinc-500 text-xs block mt-0.5 font-normal">
                                - {it.note}
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-1 text-right tabular-nums">
                            {it.price !== undefined
                              ? `${it.price.toLocaleString("vi-VN")}đ`
                              : ""}
                          </td>
                          <td className="py-1.5 px-1 text-center font-medium tabular-nums">
                            {it.quantity}
                          </td>
                          <td className="py-1.5 px-1 text-right font-semibold text-zinc-800 tabular-nums">
                            {it.price !== undefined
                              ? `${(it.quantity * it.price).toLocaleString("vi-VN")}đ`
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-border bg-muted/20 px-3 py-1.5">
                  <button
                    className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-900 px-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800 cursor-pointer border-none outline-none"
                    onClick={() =>
                      setCheckoutTarget({
                        type: "ORDER",
                        orderId: o.id,
                        total: o.totalAmount,
                      })
                    }
                  >
                    Thanh toán đơn
                  </button>
                  <span className="text-lg font-bold text-foreground">
                    {o.totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Table checkout */}
      {selected.active.length > 0 && (
        <div className="border-t border-border bg-muted/40 p-3 flex flex-col gap-2">
          {selectedOrderIds.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground uppercase">
                  Tổng tiền đã chọn ({selectedOrderIds.length} đơn)
                </span>
                <span className="text-lg font-extrabold text-zinc-900">
                  {selectedTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white py-2.5 text-lg font-bold text-zinc-800 transition-colors hover:bg-zinc-50 cursor-pointer outline-none"
                onClick={() =>
                  setCheckoutTarget({
                    type: "SELECTED_ORDERS",
                    orderIds: selectedOrderIds,
                    total: selectedTotal,
                  })
                }
              >
                Thanh toán đơn đã chọn
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground uppercase">
                  Tổng tiền bàn này ({selected.active.length} đơn)
                </span>
                <span className="text-2xl font-extrabold text-zinc-900">
                  {selected.total.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-2.5 text-lg font-bold text-white transition-colors hover:bg-zinc-800 cursor-pointer border-none outline-none"
                onClick={() =>
                  setCheckoutTarget({ type: "TABLE", total: selected.total })
                }
              >
                Thanh toán toàn bộ bàn
              </button>
            </>
          )}
        </div>
      )}

      {/* Checkout Overlay */}
      {checkoutTarget && (
        <div className="absolute inset-0 z-10 flex flex-col bg-background/95 p-4 backdrop-blur-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-base text-foreground">
              Thanh toán{" "}
              {checkoutTarget.type === "TABLE"
                ? "cả bàn"
                : checkoutTarget.type === "SELECTED_ORDERS"
                  ? `gộp các đơn đã chọn (${checkoutTarget.orderIds?.length} đơn)`
                  : `Đơn #${checkoutTarget.orderId}`}
            </h3>
            <button
              onClick={() => setCheckoutTarget(null)}
              className="rounded-full p-1 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center py-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              CẦN THANH TOÁN
            </p>
            <p className="text-2xl font-black text-zinc-900 mt-1">
              {checkoutTarget.total.toLocaleString("vi-VN")}đ
            </p>

            <div className="mt-6">
              <p className="text-xs text-muted-foreground mb-3 font-medium">
                PHƯƠNG THỨC THANH TOÁN
              </p>
              <div className="flex gap-3 justify-center max-w-xs mx-auto">
                {(["CASH", "TRANSFER"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer bg-white shadow-xs",
                      paymentMethod === m
                        ? "border-zinc-950 bg-zinc-100 text-zinc-900 ring-2 ring-zinc-950/10"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {m === "CASH" ? (
                      <>
                        <Banknote className="size-5 text-zinc-700" />
                        <span>Tiền mặt</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="size-5 text-zinc-700" />
                        <span>Chuyển khoản</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <button
              disabled={loading}
              onClick={handleConfirmCheckout}
              className="flex w-full items-center justify-center rounded-lg bg-zinc-900 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800 cursor-pointer disabled:opacity-50 border-none outline-none"
            >
              {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
