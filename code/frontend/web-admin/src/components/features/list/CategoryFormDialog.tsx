'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toViError } from '@/lib/errors';
import type { Category, CreateCategoryDto } from '@/types/category';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
  onSave: (dto: CreateCategoryDto, id?: number) => Promise<void>;
}

// Khởi tạo state thẳng từ props — không dùng useEffect để "fill lại" vì `open` được cha
// điều khiển trực tiếp (set true khi bấm Sửa/Thêm), không đi qua onOpenChange của Dialog.
// Component này remount mỗi lần mở (key={category?.id ?? 'new'} ở dưới) nên state luôn đúng.
function Inner({ category, onOpenChange, onSave }: Omit<Props, 'open'>) {
  const [name, setName]               = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [nameError, setNameError]     = useState('');
  const [loading, setLoading]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setNameError('Vui lòng nhập tên danh mục'); return; }
    setLoading(true);
    try {
      await onSave({ name: name.trim(), description: description.trim() || undefined }, category?.id);
      onOpenChange(false);
    } catch (err) {
      toast.error(toViError(err, 'Không thể lưu danh mục. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  }

  const isEdit = !!category;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
      </DialogHeader>

      <form id="cat-form" onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="cat-name" className="gap-0.5">Tên danh mục <span className="text-destructive">*</span></Label>
          <Input
            id="cat-name" value={name} maxLength={100} autoFocus
            placeholder="VD: Cà phê, Trà, Đồ ăn…" aria-invalid={!!nameError}
            onChange={e => { setName(e.target.value); setNameError(''); }}
          />
          {nameError && <p className="text-sm text-destructive">{nameError}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-desc">Mô tả</Label>
          <Textarea
            id="cat-desc" value={description} maxLength={255} rows={3}
            placeholder="Mô tả ngắn về danh mục (không bắt buộc)"
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>Hủy</Button>
        <Button type="submit" form="cat-form" disabled={loading}>
          {loading ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function CategoryFormDialog({ open, onOpenChange, category, onSave }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <Inner key={category?.id ?? 'new'} category={category} onOpenChange={onOpenChange} onSave={onSave} />}
    </Dialog>
  );
}
