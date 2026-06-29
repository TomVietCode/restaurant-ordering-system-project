'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Category } from '@/types/menu';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
  onSave: (name: string, id?: number) => Promise<void>;
}

interface InnerProps {
  category: Category | null;
  onOpenChange: (v: boolean) => void;
  onSave: (name: string, id?: number) => Promise<void>;
}

function CategoryFormInner({ category, onOpenChange, onSave }: InnerProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Tên danh mục là bắt buộc'); return; }
    setLoading(true);
    try {
      await onSave(trimmed, category?.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
          <DialogDescription>
            {category ? 'Cập nhật tên danh mục.' : 'Nhập tên để tạo danh mục mới.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <Label htmlFor="cat-name">Tên danh mục <span className="text-destructive">*</span></Label>
          <Input
            ref={inputRef}
            id="cat-name"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="VD: Cà phê"
            aria-invalid={!!error}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </form>
  );
}

export function CategoryFormDialog({ open, onOpenChange, category, onSave }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <CategoryFormInner
          key={category?.id ?? 'new'}
          category={category}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />
      )}
    </Dialog>
  );
}
