"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/order.service";
import { toViError } from "@/lib/errors";

type Phase = "verifying" | "success" | "failed";

interface Props {
  token: string | null;
}

/** Where to send the cashier back to after viewing the result. */
const CASHIER_URL = "/cashier?tab=orders";

/**
 * Verifies a VNPay return callback and shows the payment result.
 *
 * The VNPay params arrive in the URL query string; we forward them verbatim to
 * the backend (`GET /payments/vnpay-return`), which validates the signature and
 * marks the order PAID on success. A full-page navigation back to the cashier
 * refreshes the board so the paid order disappears.
 */
export function PaymentReturnClient({ token }: Props) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("vnp_TxnRef");
  // Whether VNPay actually redirected here (vs. the page being opened directly).
  const hasResult = Boolean(searchParams.get("vnp_ResponseCode"));

  const [phase, setPhase] = useState<Phase>(hasResult ? "verifying" : "failed");
  const [message, setMessage] = useState(
    hasResult ? "" : "Không tìm thấy thông tin giao dịch VNPay.",
  );
  const [amount, setAmount] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // No VNPay params → nothing to verify (handled by initial state).
    if (!searchParams.get("vnp_ResponseCode")) return;

    const query = searchParams.toString();
    let cancelled = false;

    (async () => {
      try {
        const res = await orderService.verifyVnpayReturn(query);
        if (cancelled) return;
        if (res.success) {
          setPhase("success");
          setAmount(res.data?.amount ?? null);
        } else {
          setPhase("failed");
          setMessage(res.message || "Thanh toán thất bại.");
        }
      } catch (err) {
        if (cancelled) return;
        setPhase("failed");
        setMessage(toViError(err, "Không xác minh được kết quả thanh toán."));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const backToCashier = () => {
    // Full navigation so the cashier board refetches (paid order drops off).
    window.location.href = CASHIER_URL;
  };

  /** Re-create a VNPay payment for the same order and redirect again. */
  const retry = async () => {
    if (!orderId) return;
    setRetrying(true);
    try {
      const url = await orderService.createVnpayPaymentUrl(token, Number(orderId));
      window.location.href = url;
    } catch (err) {
      console.error("Failed to retry VNPay payment:", err);
      setRetrying(false);
      setMessage(toViError(err, "Không thể khởi tạo lại thanh toán."));
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
      {phase === "verifying" && (
        <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
          <Loader2 className="size-10 animate-spin" />
          <p className="text-sm">Đang xác minh kết quả thanh toán...</p>
        </div>
      )}

      {phase === "success" && (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="size-14 text-emerald-500" />
          <h1 className="text-xl font-bold text-zinc-900">
            Thanh toán thành công
          </h1>
          <p className="text-sm text-muted-foreground">
            {orderId ? `Đơn #${orderId} đã được thanh toán` : "Đơn đã được thanh toán"}
            {amount !== null ? ` — ${amount.toLocaleString("vi-VN")}đ` : ""}.
          </p>
          <Button className="mt-4 w-full" onClick={backToCashier}>
            Về trang thu ngân
          </Button>
        </div>
      )}

      {phase === "failed" && (
        <div className="flex flex-col items-center gap-3">
          <XCircle className="size-14 text-destructive" />
          <h1 className="text-xl font-bold text-zinc-900">Thanh toán thất bại</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="mt-4 flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={backToCashier}>
              Về trang thu ngân
            </Button>
            {orderId && (
              <Button className="flex-1" onClick={retry} disabled={retrying}>
                {retrying ? "Đang xử lý..." : "Thử lại"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
