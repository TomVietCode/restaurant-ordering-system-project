'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Category, CreateCategoryDto } from '@/types/menu';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
  onSave: (dto: CreateCategoryDto, id?: number) => Promise<void>;
}

function categoryToForm(cat: Category | null): string {
  return cat?.name ?? '';
}

export function CategoryFormDialog({ open, onOpenChange, category, onSave }: Props) {
  const [name, setName] = useState(() => categoryToForm(category));
  const [nameError, setNameError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  function handleOpenChange(v: boolean) {
    if (v) {
      setName(categoryToForm(category));
      setNameError(undefined);
    }
    onOpenChange(v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Tên danh mục là bắt buộc');
      return;
    }
    setLoading(true);
    try {
      await onSave({ name: name.trim() }, category?.id);
      onOpenChange(false);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
          <DialogDescription>
            {category
              ? 'Cập nhật tên danh mục.'
              : 'Điền tên để tạo danh mục mới.'}
          </DialogDescription>
        </DialogHeader>

        <form id="cat-form" onSubmit={handleSubmit} className="py-2">
          <div className="space-y-1">
            <Label htmlFor="cat-name">
              Tên danh mục <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-name"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setNameError(undefined);
              }}
              placeholder="VD: Cà phê, Trà, Đồ ăn…"
              aria-invalid={!!nameError}
              autoFocus
            />
            {nameError && <p className="text-sm text-destructive">{nameError}</p>}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="submit" form="cat-form" disabled={loading}>
            {loading ? 'Đang lưu…' : category ? 'Cập nhật' : 'Thêm danh mục'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
