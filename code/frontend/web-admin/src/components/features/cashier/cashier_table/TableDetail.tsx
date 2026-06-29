import { useState, useEffect } from 'react';
import { Armchair, Clock, Banknote, QrCode, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order';
import type { Row, TblStatus } from './TablePanel';

const TBL_LABEL: Record<TblStatus, string> = { WAITPAY: 'Chờ TT', SERVING: 'Phục vụ', EMPTY: 'Trống' };
const TBL_BADGE: Record<TblStatus, string> = {
  WAITPAY: 'bg-status-paid text-status-paid-foreground',
  SERVING: 'bg-status-preparing text-status-preparing-foreground',
  EMPTY:   'bg-muted text-muted-foreground',
};
const ORDER_LABEL: Record<OrderStatus, string> = {
  NEW: 'Mới', PREPARING: 'Đang làm', SERVED: 'Đã phục vụ', PAID: 'Đã TT', CANCEL: 'Đã hủy',
};
const ORDER_BADGE: Record<OrderStatus, string> = {
  NEW:       'bg-status-new text-status-new-foreground',
  PREPARING: 'bg-status-preparing text-status-preparing-foreground',
  SERVED:    'bg-status-served text-status-served-foreground',
  PAID:      'bg-status-paid text-status-paid-foreground',
  CANCEL:    'bg-status-cancel text-status-cancel-foreground',
};

export function TableDetail({
  selected,
  onPayTable,
  onPayOrders,
}: {
  selected: Row | null;
  onPayTable: (tableId: string, paymentMethod: 'CASH' | 'TRANSFER') => Promise<void>;
  onPayOrders: (tableId: string, orderIds: number[], paymentMethod: 'CASH' | 'TRANSFER') => Promise<void>;
}) {
  const [checkoutTarget, setCheckoutTarget] = useState<{
    type: 'TABLE' | 'ORDER' | 'SELECTED_ORDERS';
    orderId?: number;
    orderIds?: number[];
    total: number;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [loading, setLoading] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  useEffect(() => {
    setCheckoutTarget(null);
    setSelectedOrderIds([]);
  }, [selected?.id]);

  const toggleSelectOrder = (id: number) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (!selected) {
    return (
      <div className="flex flex-[2] flex-col items-center justify-center gap-2 text-muted-foreground">
        <Armchair className="size-8" strokeWidth={1.5} />
        <p className="text-sm">Chọn bàn để xem chi tiết</p>
      </div>
    );
  }

  const sorted = [...selected.active].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

  const selectedTotal = sorted
    .filter(o => selectedOrderIds.includes(o.id))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handleConfirmCheckout = async () => {
    if (!checkoutTarget) return;
    setLoading(true);
    try {
      if (checkoutTarget.type === 'TABLE') {
        await onPayTable(selected.id, paymentMethod);
      } else if (checkoutTarget.type === 'ORDER' && checkoutTarget.orderId !== undefined) {
        await onPayOrders(selected.id, [checkoutTarget.orderId], paymentMethod);
      } else if (checkoutTarget.type === 'SELECTED_ORDERS' && checkoutTarget.orderIds !== undefined) {
        await onPayOrders(selected.id, checkoutTarget.orderIds, paymentMethod);
      }
      setCheckoutTarget(null);
      setSelectedOrderIds([]);
    } catch (err) {
      console.error(err);
      alert('Thanh toán thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-[2] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="font-semibold">{selected.name}</p>
          <p className="text-xs text-muted-foreground">
            {selected.active.length ? `${selected.active.length} đơn` : 'Không có đơn'}
            {selected.capacity ? ` · ${selected.capacity} chỗ` : ''}
          </p>
        </div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', TBL_BADGE[selected.tblStatus])}>
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
          sorted.map(o => {
            return (
              <div key={o.id} className="overflow-hidden rounded-lg border border-border bg-white shadow-xs">
                <div 
                  className="flex items-center justify-between bg-secondary/50 px-3 py-1.5 border-b border-border cursor-pointer select-none"
                  onClick={() => toggleSelectOrder(o.id)}
                >
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(o.id)}
                      onChange={() => toggleSelectOrder(o.id)}
                      className="size-4 rounded border-gray-350 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold" onClick={() => toggleSelectOrder(o.id)}>#{o.id}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', ORDER_BADGE[o.status])}>
                      {ORDER_LABEL[o.status]}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 px-3 py-2">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex justify-between items-center text-xs text-foreground/80">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-4 text-right text-muted-foreground font-medium">{it.quantity}×</span>
                        <span className="truncate">{it.name}</span>
                        {it.price !== undefined && (
                          <span className="text-[10px] text-muted-foreground">({it.price.toLocaleString('vi-VN')}đ)</span>
                        )}
                        {it.note && <span className="text-amber-600 text-[10px] ml-1">✏ {it.note}</span>}
                      </div>
                      <span className="font-semibold text-muted-foreground shrink-0 text-right">
                        {it.price !== undefined ? `${(it.quantity * it.price).toLocaleString('vi-VN')}đ` : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-border bg-muted/20 px-3 py-1.5">
                  <span className="text-xs font-bold text-foreground">Tổng: {o.totalAmount.toLocaleString('vi-VN')}đ</span>
                  <button
                    className="inline-flex h-7 items-center justify-center rounded-md bg-green-600 px-2.5 text-[11px] font-bold text-white transition-colors hover:bg-green-700 cursor-pointer border-none outline-none"
                    onClick={() => setCheckoutTarget({ type: 'ORDER', orderId: o.id, total: o.totalAmount })}
                  >
                    💰 Thanh toán đơn
                  </button>
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
                <span className="text-xs font-bold text-muted-foreground uppercase">Tổng tiền đã chọn ({selectedOrderIds.length} đơn)</span>
                <span className="text-lg font-extrabold text-orange-600">
                  {selectedTotal.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-green-700 cursor-pointer border-none outline-none"
                onClick={() => setCheckoutTarget({ type: 'SELECTED_ORDERS', orderIds: selectedOrderIds, total: selectedTotal })}
              >
                💰 Thanh toán đơn đã chọn
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Tổng tiền bàn này ({selected.active.length} đơn)</span>
                <span className="text-lg font-extrabold text-orange-600">
                  {selected.total.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-xs font-bold text-white transition-colors hover:bg-orange-600 cursor-pointer border-none outline-none"
                onClick={() => setCheckoutTarget({ type: 'TABLE', total: selected.total })}
              >
                💳 Thanh toán toàn bộ bàn
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
              Thanh toán {
                checkoutTarget.type === 'TABLE'
                  ? 'cả bàn'
                  : checkoutTarget.type === 'SELECTED_ORDERS'
                  ? `gộp các đơn đã chọn (${checkoutTarget.orderIds?.length} đơn)`
                  : `Đơn #${checkoutTarget.orderId}`
              }
            </h3>
            <button
              onClick={() => setCheckoutTarget(null)}
              className="rounded-full p-1 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center py-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">CẦN THANH TOÁN</p>
            <p className="text-2xl font-black text-orange-600 mt-1">
              {checkoutTarget.total.toLocaleString('vi-VN')}đ
            </p>

            <div className="mt-6">
              <p className="text-xs text-muted-foreground mb-3 font-medium">PHƯƠNG THỨC THANH TOÁN</p>
              <div className="flex gap-3 justify-center max-w-xs mx-auto">
                {(['CASH', 'TRANSFER'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer bg-white shadow-xs',
                      paymentMethod === m
                        ? 'border-orange-500 bg-orange-50/50 text-orange-700 ring-2 ring-orange-500/20'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {m === 'CASH' ? (
                      <>
                        <Banknote className="size-5 text-green-600" />
                        <span>Tiền mặt</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="size-5 text-blue-600" />
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
              className="flex w-full items-center justify-center rounded-lg bg-green-600 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700 cursor-pointer disabled:opacity-50 border-none outline-none"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </button>
            <p className="text-[10px] text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 leading-normal">
              Lưu ý: Thao tác này không thể hoàn tác sau khi xác nhận.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
