'use client';

import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Pencil, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TABLE_STATUS_CLASS, TABLE_STATUS_LABEL } from '@/types/table';
import type { Table } from '@/types/table';

interface Props {
  table: Table;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

export function TableCard({ table, onEdit, onDelete, onToggle }: Props) {
  const canToggle = table.status !== 'OCCUPIED';
  const qrRef = useRef<HTMLDivElement>(null);

  function downloadQr() {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }),
    );
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 400;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `qr-${table.name.replace(/\s+/g, '-')}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      }, 'image/png');
    };
    img.src = url;
  }

  return (
    <Card className="relative">
      {/* Badge trạng thái */}
      <span className={cn(
        'absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold',
        TABLE_STATUS_CLASS[table.status],
      )}>
        {TABLE_STATUS_LABEL[table.status]}
      </span>

      <CardHeader className="pb-2 pr-24">
        <CardTitle className="text-base">{table.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{table.capacity} chỗ</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Mã QR */}
        <div ref={qrRef} className="flex items-center justify-center rounded-lg border bg-white p-3">
          <QRCode value={table.id} size={120} bgColor="#ffffff" fgColor="#1a1a1a" level="M" />
        </div>

        {/* Tải QR + Toggle trạng thái */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={downloadQr}>
            <Download className="size-3.5" /> Tải mã QR
          </Button>
          <button
            type="button"
            role="switch"
            aria-checked={table.status === 'AVAILABLE'}
            disabled={!canToggle}
            onClick={onToggle}
            title={
              table.status === 'OCCUPIED' ? 'Bàn đang có khách' :
              table.status === 'AVAILABLE' ? 'Nhấn để đóng bàn' : 'Nhấn để mở bàn'
            }
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200',
              !canToggle
                ? 'cursor-not-allowed opacity-40 bg-input'
                : table.status === 'AVAILABLE'
                  ? 'cursor-pointer bg-primary'
                  : 'cursor-pointer bg-input',
            )}
          >
            <span className={cn(
              'inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200',
              table.status === 'AVAILABLE' ? 'translate-x-5' : 'translate-x-0',
            )} />
          </button>
        </div>

        {/* Sửa / Xóa */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={onEdit}>
            <Pencil className="size-3.5" /> Sửa
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            disabled={table.status !== 'AVAILABLE'}
            title={
              table.status === 'OCCUPIED' ? 'Bàn đang có khách, không thể xóa' :
              table.status === 'CLOSED'   ? 'Bàn đang đóng, không thể xóa' :
              'Nhấn để xóa bàn'
            }
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" /> Xóa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
