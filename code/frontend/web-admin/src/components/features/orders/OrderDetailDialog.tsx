'use client';

import { Clock, UtensilsCrossed, Wallet, CalendarCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ORDER_STATUS_LABEL, ORDER_STATUS_CLASS, type Order } from '@/types/order';
import { formatVnDateTime } from '@/lib/datetime';

interface Props {
  order: Order | null;
  loading: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const fmtMoney = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
};

export function OrderDetailDialog({ order, loading, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        </DialogHeader>

        {order && (
          <div key={order.id} className="space-y-3">
            {/* Mã đơn + trạng thái */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Mã đơn</p>
                <p className="font-mono text-sm font-semibold text-foreground">#{order.trackingCode}</p>
              </div>
              <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_CLASS[order.status]}`}>
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            </div>

            {/* Bàn + Thời gian đặt */}
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-secondary/40 p-3">
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <UtensilsCrossed className="size-3.5" /> Bàn
                </p>
                <p className="text-sm font-medium text-foreground">{order.tableName}</p>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> Thời gian đặt
                </p>
                <p className="text-sm font-medium text-foreground">{formatVnDateTime(order.createdAt)}</p>
              </div>
            </div>

            {/* Bảng món */}
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[42%]" /><col className="w-[18%]" /><col className="w-[14%]" /><col className="w-[26%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border">
                  <th className="py-1.5 pr-2 text-left font-medium text-muted-foreground">Tên món</th>
                  <th className="py-1.5 pr-2 text-right font-medium text-muted-foreground">Đơn giá</th>
                  <th className="py-1.5 pr-2 text-center font-medium text-muted-foreground">SL</th>
                  <th className="py-1.5 text-right font-medium text-muted-foreground">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-1.5 pr-2 text-foreground">
                      {it.name}
                      {it.note && <p className="text-xs font-normal text-muted-foreground">Ghi chú: {it.note}</p>}
                    </td>
                    <td className="py-1.5 pr-2 text-right text-muted-foreground">{fmtMoney(it.price ?? 0)}</td>
                    <td className="py-1.5 pr-2 text-center text-muted-foreground">{it.quantity}</td>
                    <td className="py-1.5 text-right font-medium text-foreground">{fmtMoney((it.price ?? 0) * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-border" />

            {/* Tổng kết thanh toán — đơn đã hủy không hiển thị tổng tiền */}
            <div className="rounded-lg bg-secondary/40 p-3">
              {order.status === 'CANCEL' ? (
                <div className="space-y-1.5 text-center">
                  <p className="text-sm text-muted-foreground">Đơn đã hủy — không tính tiền</p>
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">Lý do hủy: </span>
                    <span className="font-medium">{order.cancelReason?.trim() || 'Không có lý do'}</span>
                  </p>
                </div>
              ) : (
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-foreground">Tổng tiền</span>
                  <span className="text-lg font-semibold text-primary">{fmtMoney(order.totalAmount)}</span>
                </div>
              )}

              {order.status === 'PAID' && (
                <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-border pt-2.5">
                  <div>
                    <p className="text-xs text-muted-foreground">Phương thức thanh toán</p>
                    <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                      <Wallet className="size-3.5" />
                      {order.paymentMethod ? PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Thời gian thanh toán</p>
                    <p className="flex items-center justify-end gap-1 text-sm font-medium text-foreground">
                      <CalendarCheck className="size-3.5" />
                      {order.paidAt ? formatVnDateTime(order.paidAt) : '—'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {loading && <p className="text-center text-xs text-muted-foreground">Đang tải chi tiết mới nhất…</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
