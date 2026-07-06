import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

interface Props {
  order: Order;
  border: string;
  onPrepare?: () => void;
  onPay?: () => void;
  onCancel?: () => void;
}

export function CashierOrderCard({
  order,
  border,
  onPrepare,
  onPay,
  onCancel,
}: Props) {
  return (
    <div className={cn("rounded-xl border-2 bg-white p-3 shadow-sm", border)}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold">
          {order.tableName}
        </span>
        <span
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-600"
          title="Mã đơn hàng"
        >
          #{order.trackingCode}
        </span>
      </div>
      {order.status === "SERVED" ? (
        <p className="mb-2 text-sm text-muted-foreground">
          {order.items.length} món · {order.totalAmount.toLocaleString("vi-VN")}
          đ
        </p>
      ) : (
        <ul className="mb-2 space-y-0.5 text-sm">
          {order.items.map((it, i) => (
            <li key={i}>
              {it.quantity}x {it.name}
              {it.note && (
                <span className="ml-1 text-xs text-zinc-600 block"> - {it.note}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        {onPrepare && (
          <Button
            size="sm"
            className="flex-1 bg-status-new-dot text-xs text-white hover:bg-status-new-foreground py-4"
            onClick={onPrepare}
          >
            Xác nhận
          </Button>
        )}
        {onPay && (
          <Button
            size="sm"
            className="flex-1 bg-green-500 text-xs text-white hover:bg-green-600 py-4"
            onClick={onPay}
          >
            Thanh toán đơn này
          </Button>
        )}
        {onCancel && (
          <Button
            size="sm"
            variant="outline"
            className="border-destructive text-xs text-destructive flex-1 hover:bg-destructive hover:text-white py-4"
            onClick={onCancel}
          >
            Hủy
          </Button>
        )}
      </div>
    </div>
  );
}
