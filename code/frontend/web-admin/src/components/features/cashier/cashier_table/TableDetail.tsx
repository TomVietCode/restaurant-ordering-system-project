import { Armchair, Clock } from 'lucide-react';
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

export function TableDetail({ selected }: { selected: Row | null }) {
  if (!selected) {
    return (
      <div className="flex flex-[2] flex-col items-center justify-center gap-2 text-muted-foreground">
        <Armchair className="size-8" strokeWidth={1.5} />
        <p className="text-sm">Chọn bàn để xem chi tiết</p>
      </div>
    );
  }

  const sorted = [...selected.active].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

  return (
    <div className="flex flex-[2] flex-col overflow-hidden">
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
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Armchair className="size-6" strokeWidth={1.5} />
            <p className="text-xs">Bàn đang trống</p>
          </div>
        ) : (
          sorted.map(o => {
            // const mins = Math.floor((Date.now() - +new Date(o.createdAt)) / 60_000);
            return (
              <div key={o.id} className="overflow-hidden rounded-lg border border-border">
                <div className="flex items-center justify-between bg-secondary px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">#{o.id}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', ORDER_BADGE[o.status])}>
                      {ORDER_LABEL[o.status]}
                    </span>
                  </div>
                  {/* <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />{mins === 0 ? 'vừa xong' : `${mins}p`}
                  </span> */}
                </div>
                <div className="space-y-0.5 px-3 py-2">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="w-4 text-right text-muted-foreground">{it.quantity}×</span>
                      <span className="flex-1">{it.name}</span>
                      {it.note && <span className="text-warning-foreground">✏ {it.note}</span>}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end border-t border-border px-3 py-1">
                  <span className="text-xs font-semibold text-primary">{o.totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
