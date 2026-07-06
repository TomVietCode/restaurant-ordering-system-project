import { Suspense } from "react";
import { auth } from "@/auth";
import { PaymentReturnClient } from "@/components/features/cashier/payment/PaymentReturnClient";

/**
 * VNPay return page (`vnp_ReturnUrl`).
 *
 * VNPay redirects the browser here after the customer finishes paying. The
 * client component reads the VNPay query params, verifies them against the
 * backend (which marks the order PAID), and shows the result.
 */
export default async function PaymentReturnPage() {
  const session = await auth();
  const token = session?.accessToken ?? null;

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">
            Đang tải kết quả thanh toán...
          </div>
        }
      >
        <PaymentReturnClient token={token} />
      </Suspense>
    </div>
  );
}
