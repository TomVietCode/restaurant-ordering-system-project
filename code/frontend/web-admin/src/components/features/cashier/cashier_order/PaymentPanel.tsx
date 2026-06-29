import { Banknote, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/order';

type Method = 'CASH' | 'TRANSFER';

interface Props {
  tableName: string; orders: Order[]; total: number;
  method: Method; onMethod: (m: Method) => void;
  onConfirm: () => void; onClose: () => void;
}

export function PaymentPanel({ tableName, orders, total, method, onMethod, onConfirm, onClose }: Props) {
  return (
    <div className="flex flex-col rounded-xl border border-orange-200 bg-orange-50 p-4">
      <h2 className="mb-3 font-bold text-orange-700">Thanh toán — {tableName}</h2>
      <div className="mb-3 flex-1 space-y-3 overflow-y-auto text-sm pr-1">
        {orders.map(o => (
          <div key={o.id} className="border-b border-orange-150 pb-2 last:border-b-0 last:pb-0">
            <div className="font-bold text-orange-800 text-xs">Đơn #{o.id}</div>
            <ul className="mt-1 space-y-1 pl-1">
              {o.items.map((it, i) => (
                <li key={i} className="flex justify-between text-xs text-orange-950">
                  <span className="truncate pr-1">
                    {it.quantity}x {it.name}
                    {it.price !== undefined && (
                      <span className="text-orange-700/60 ml-1 text-[10px]">
                        ({it.price.toLocaleString('vi-VN')}đ)
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-orange-900 shrink-0">
                    {it.price !== undefined
                      ? `${(it.quantity * it.price).toLocaleString('vi-VN')}đ`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mb-4 border-t pt-3">
        <p className="text-sm text-muted-foreground">TỔNG CỘNG</p>
        <p className="text-2xl font-black text-orange-600">{total.toLocaleString('vi-VN')}đ</p>
      </div>
      <div className="mb-4 flex gap-2">
        {(['CASH', 'TRANSFER'] as Method[]).map(m => (
          <button key={m} onClick={() => onMethod(m)}
            className={cn('flex flex-1 items-center justify-center gap-1 rounded-lg border py-2 text-xs font-medium',
              method === m ? 'border-orange-500 bg-orange-500 text-white' : 'border-border bg-white hover:bg-muted')}>
            {m === 'CASH' ? <><Banknote className="size-3" />Tiền mặt</> : <><QrCode className="size-3" />Chuyển khoản</>}
          </button>
        ))}
      </div>
      <Button className="mb-2 w-full bg-green-500 font-bold text-white hover:bg-green-600" onClick={onConfirm}>Xác nhận thanh toán</Button>
      <Button variant="outline" className="w-full" onClick={onClose}>Đóng</Button>
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
        Warning: Sau khi xác nhận không thể sửa/hủy
      </p>
    </div>
  );
}
