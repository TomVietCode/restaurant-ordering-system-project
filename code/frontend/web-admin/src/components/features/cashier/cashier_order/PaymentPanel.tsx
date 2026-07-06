import { Banknote, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/order';

type Method = 'CASH' | 'TRANSFER';

interface Props {
  tableName: string; orders: Order[]; total: number;
  method: Method; onMethod: (m: Method) => void;
  onConfirm: () => void; onClose: () => void;
  /** True while a VNPay redirect is in flight — disables the confirm button. */
  processing?: boolean;
}

export function PaymentPanel({ tableName, orders, total, method, onMethod, onConfirm, onClose, processing = false }: Props) {
  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
      <h2 className="mb-3 font-bold text-zinc-900 text-xl">Thanh toán — {tableName}</h2>
      <div className="mb-3 flex-1 space-y-4 overflow-y-auto text-sm pr-1">
        {orders.map(o => (
          <div key={o.id} className="border-b border-zinc-200 pb-3 last:border-b-0 last:pb-0">
            <div className="font-bold text-zinc-900 text-base mb-2">Đơn #{o.trackingCode}</div>
            
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-200 text-sm font-semibold text-zinc-500 uppercase tracking-wide">
                  <th className="py-1 px-1 font-semibold text-left">Tên món</th>
                  <th className="py-1 px-1 font-semibold text-right w-[80px]">Đơn giá</th>
                  <th className="py-1 px-1 font-semibold text-center w-[40px]">SL</th>
                  <th className="py-1 px-1 font-semibold text-right w-[100px]">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {o.items.map((it, i) => (
                  <tr key={i} className="text-zinc-800 text-sm hover:bg-zinc-100/50">
                    <td className="py-1.5 px-1 pr-2 max-w-[150px] truncate font-medium">
                      {it.name}
                      {it.note && <span className="text-zinc-600 text-xs block mt-0.5 font-normal">- {it.note}</span>}
                    </td>
                    <td className="py-1.5 px-1 text-right text-zinc-500 tabular-nums">
                      {it.price !== undefined ? `${it.price.toLocaleString('vi-VN')}đ` : ''}
                    </td>
                    <td className="py-1.5 px-1 text-center font-medium tabular-nums">
                      {it.quantity}
                    </td>
                    <td className="py-1.5 px-1 text-right font-semibold text-zinc-900 tabular-nums">
                      {it.price !== undefined
                        ? `${(it.quantity * it.price).toLocaleString('vi-VN')}đ`
                        : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      
      <div className="mb-4 border-t border-zinc-200 pt-3 flex justify-between items-center">
        <span className="text-sm font-bold text-zinc-700">TỔNG CỘNG</span>
        <span className="text-2xl font-black text-zinc-900">{total.toLocaleString('vi-VN')}đ</span>
      </div>
      
      <div className="mb-4 flex gap-2">
        {(['CASH', 'TRANSFER'] as Method[]).map(m => (
          <button key={m} onClick={() => onMethod(m)}
            className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-semibold transition-colors duration-150',
              method === m 
                ? 'border-zinc-900 bg-zinc-900 text-white' 
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
            )}
          >
            {m === 'CASH' ? <><Banknote className="size-3.5" />Tiền mặt</> : <><QrCode className="size-3.5" />Chuyển khoản</>}
          </button>
        ))}
      </div>
      <Button className="mb-2 w-full h-10 bg-zinc-900 font-bold text-white hover:bg-zinc-800 text-base" onClick={onConfirm} disabled={processing}>
        {processing
          ? 'Đang chuyển đến VNPay...'
          : method === 'TRANSFER'
            ? 'Thanh toán qua VNPay'
            : 'Xác nhận thanh toán'}
      </Button>
      <Button variant="outline" className="w-full h-10 border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-base" onClick={onClose} disabled={processing}>Đóng</Button>
    </div>
  );
}
