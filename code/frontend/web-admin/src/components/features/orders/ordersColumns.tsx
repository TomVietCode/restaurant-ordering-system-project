import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ColumnDef } from '@/components/ui/data-table';
import { ORDER_STATUS_LABEL, ORDER_STATUS_CLASS, type Order } from '@/types/order';
import { formatVnDateTime } from '@/lib/datetime';

const fmtMoney = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';

interface Args {
  onView: (order: Order) => void;
}

export function getOrdersColumns({ onView }: Args): ColumnDef<Order>[] {
  return [
    {
      accessorKey: 'trackingCode',
      header: 'Mã đơn',
      cell: ({ row }) => (
        <span className="font-mono font-medium text-foreground">
          #{row.original.trackingCode.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      id: 'itemCount',
      header: () => <div className="text-center">Số món</div>,
      cell: ({ row }) => <div className="text-center">{row.original.items.length}</div>,
    },
    {
      accessorKey: 'totalAmount',
      header: () => <div className="text-right">Tổng tiền</div>,
      cell: ({ row }) => <div className="text-right font-medium">{fmtMoney(row.original.totalAmount)}</div>,
    },
    {
      accessorKey: 'status',
      header: () => <div className="text-center">Trạng thái</div>,
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <div className="flex justify-center">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_CLASS[s]}`}>
              {ORDER_STATUS_LABEL[s]}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Thời gian đặt',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatVnDateTime(row.original.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Thao tác</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => onView(row.original)} title="Xem chi tiết">
            <Eye className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
