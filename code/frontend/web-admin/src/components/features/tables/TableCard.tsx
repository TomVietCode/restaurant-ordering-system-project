import { Pencil, Trash2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Table } from '@/types/table';

interface Props {
  table: Table;
  onEdit: () => void;
  onDelete: () => void;
  onDetail: () => void;
}

export function TableCard({ table, onEdit, onDelete,onDetail }: Props) {
  return (
    <Card className="relative">
      {/* Badge trạng thái */}
      <span className={cn(
        'absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold',
        table.isAvailable
          ? 'bg-status-paid text-status-paid-foreground'
          : 'bg-status-cancel text-status-cancel-foreground',
      )}>
        {table.isAvailable ? 'Trống' : 'Có khách'}
      </span>

      <CardHeader className="pb-2 pr-24">
        <CardTitle className="text-base">{table.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {table.capacity ? `${table.capacity} chỗ` : 'Chưa có sức chứa'}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* QR placeholder */}
        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/50">
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <QrCode className="size-10 opacity-40" />
            <span className="text-xs">Mã QR</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">

          <Button size="sm" variant="outline" className="flex-1" onClick={onDetail}>
            <Pencil className="size-3.5" /> Chi tiết
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={onEdit}>
            <Pencil className="size-3.5" /> Sửa
          </Button>
          <Button size="sm" variant="destructive" className="flex-1" onClick={onDelete}>
            <Trash2 className="size-3.5" /> Xóa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
