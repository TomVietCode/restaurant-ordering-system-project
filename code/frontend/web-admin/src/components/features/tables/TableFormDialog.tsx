'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { tableService } from '@/services/table.service';
import type { Table } from '@/types/table';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  table: Table | null; // null = thêm mới, Table = chỉnh sửa
  existingNames: string[];
  onDone: (t: Table) => void;
}

export function TableFormDialog({ open, onOpenChange, table, existingNames, onDone }: Props) {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;
  const isEdit = !!table;

  const [name, setName]             = useState('');
  const [capacity, setCapacity]     = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [nameError, setNameError]   = useState('');
  const [loading, setLoading]       = useState(false);

  // Reset form mỗi khi dialog mở
  useEffect(() => {
    if (!open) return;
    setName(table?.name ?? '');
    setCapacity(table?.capacity != null ? String(table.capacity) : '');
    setIsAvailable(table ? table.status === 'AVAILABLE' : true);
    setNameError('');
  }, [open, table]);

  const isValid = name.trim() !== '' && Number(capacity) >= 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();

    // Validate tên trùng (bỏ qua tên hiện tại khi sửa)
    const otherNames = isEdit
      ? existingNames.filter(n => n.toLowerCase() !== table!.name.toLowerCase())
      : existingNames;
    if (otherNames.some(n => n.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error('Tên bàn đã tồn tại');
      setNameError('Tên bàn đã tồn tại');
      return;
    }

    setLoading(true);
    try {
      const saved = isEdit
        ? await tableService.update(token, table!.id, {
            name: trimmedName,
            capacity: Number(capacity),
            status: isAvailable ? 'AVAILABLE' : 'CLOSED',
          })
        : await tableService.create(token, {
            name: trimmedName,
            capacity: Number(capacity),
            status: isAvailable ? 'AVAILABLE' : 'CLOSED',
          });

      toast.success(isEdit ? 'Cập nhật bàn thành công' : 'Thêm bàn thành công');
      onOpenChange(false);
      onDone(saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}</DialogTitle>
        </DialogHeader>

        <form id="table-form" onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Tên bàn */}
          <div className="space-y-1.5">
            <Label htmlFor="table-name">
              Tên bàn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="table-name"
              value={name}
              placeholder="Bàn 01"
              autoFocus
              aria-invalid={!!nameError}
              onChange={e => { setName(e.target.value); setNameError(''); }}
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          {/* Sức chứa */}
          <div className="space-y-1.5">
            <Label htmlFor="table-capacity">
              Sức chứa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="table-capacity"
              type="number"
              min={1}
              value={capacity}
              placeholder="4"
              onChange={e => setCapacity(e.target.value)}
            />
          </div>

          {/* Toggle trạng thái */}
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Trạng thái bàn</p>
              <p className="text-xs text-muted-foreground">
                {isAvailable ? 'Mở — khách có thể đặt bàn' : 'Đóng — không nhận khách'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAvailable}
              onClick={() => setIsAvailable(v => !v)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200',
                isAvailable ? 'bg-primary' : 'bg-input',
              )}
            >
              <span className={cn(
                'inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200',
                isAvailable ? 'translate-x-5' : 'translate-x-0',
              )} />
            </button>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" form="table-form" disabled={!isValid || loading}>
            {loading
              ? (isEdit ? 'Đang lưu…' : 'Đang thêm…')
              : (isEdit ? 'Lưu' : 'Thêm mới')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
