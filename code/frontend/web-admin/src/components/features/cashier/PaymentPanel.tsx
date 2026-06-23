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
      <div className="mb-3 flex-1 space-y-1 overflow-y-auto text-sm">
        {orders.map(o => (
          <div key={o.id}>
            <span className="text-muted-foreground">#{o.id} · {o.items.length} món ···· </span>
            <span className="font-medium">{o.totalAmount.toLocaleString('vi-VN')}đ</span>
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
