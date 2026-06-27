'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetDescription,
  SheetFooter, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import type { Category, Item } from '@/types/menu';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: Item | null;
  categories: Category[];
  onSave: (data: FormValues, id?: number) => Promise<void>;
}

export interface FormValues {
  name: string;
  price: number;
  categoryId: number;
  description: string;
  isRemain: boolean;
}

interface Errors {
  name?: string;
  price?: string;
  categoryId?: string;
}

interface InnerProps {
  item: Item | null;
  categories: Category[];
  onOpenChange: (v: boolean) => void;
  onSave: (data: FormValues, id?: number) => Promise<void>;
}

function itemToForm(item: Item | null): FormValues {
  if (!item) return { name: '', price: 0, categoryId: 0, description: '', isRemain: true };
  return {
    name: item.name,
    price: item.price,
    categoryId: item.categoryId,
    description: item.description ?? '',
    isRemain: item.isRemain,
  };
}

function ItemFormInner({ item, categories, onOpenChange, onSave }: InnerProps) {
  const [form, setForm] = useState<FormValues>(() => itemToForm(item));
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: Errors = {};
    if (!form.name.trim()) e.name = 'Tên món là bắt buộc';
    if (form.price < 0 || isNaN(form.price)) e.price = 'Giá bán phải là số hợp lệ ≥ 0';
    if (!form.categoryId) e.categoryId = 'Vui lòng chọn danh mục';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave(form, item?.id);
      onOpenChange(false);
    } catch (err) {
      setErrors({ name: err instanceof Error ? err.message : 'Đã xảy ra lỗi' });
    } finally {
      setLoading(false);
    }
  }

  function field<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  return (
    <SheetContent className="flex w-full flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle>{item ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}</SheetTitle>
        <SheetDescription>
          {item ? 'Cập nhật thông tin món ăn.' : 'Điền thông tin để thêm món vào thực đơn.'}
        </SheetDescription>
      </SheetHeader>

      <form id="item-form" onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto py-4 pr-1">
        {/* Tên món */}
        <div className="space-y-1">
          <Label htmlFor="item-name">Tên món <span className="text-destructive">*</span></Label>
          <Input
            id="item-name"
            value={form.name}
            onChange={e => field('name', e.target.value)}
            placeholder="VD: Cà phê đen"
            aria-invalid={!!errors.name}
            autoFocus
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Danh mục */}
        <div className="space-y-1">
          <Label>Danh mục <span className="text-destructive">*</span></Label>
          <Select
            value={form.categoryId ? String(form.categoryId) : ''}
            onValueChange={v => v && field('categoryId', Number(v))}
          >
            <SelectTrigger className="w-full" aria-invalid={!!errors.categoryId}>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId}</p>}
        </div>

        {/* Giá bán */}
        <div className="space-y-1">
          <Label htmlFor="item-price">Giá bán (đ) <span className="text-destructive">*</span></Label>
          <Input
            id="item-price"
            type="number"
            min={0}
            value={form.price}
            onChange={e => field('price', Number(e.target.value))}
            placeholder="30000"
            aria-invalid={!!errors.price}
          />
          {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
        </div>

        {/* Mô tả */}
        <div className="space-y-1">
          <Label htmlFor="item-desc">Mô tả (tùy chọn)</Label>
          <Textarea
            id="item-desc"
            value={form.description}
            onChange={e => field('description', e.target.value)}
            placeholder="Mô tả ngắn về món ăn…"
            rows={3}
          />
        </div>

        {/* Trạng thái
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Trạng thái</p>
            <p className="text-xs text-muted-foreground">
              {form.isRemain ? 'Còn hàng — khách có thể đặt món' : 'Hết hàng — nút đặt bị disable'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isRemain}
            onClick={() => field('isRemain', !form.isRemain)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${form.isRemain ? 'bg-primary' : 'bg-input'}`}
          >
            <span
              className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${form.isRemain ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div> */}
      </form>

      <SheetFooter className="gap-2">
        <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>Hủy</Button>
        <Button type="submit" form="item-form" disabled={loading}>
          {loading ? 'Đang lưu…' : item ? 'Cập nhật' : 'Thêm món'}
        </Button>
      </SheetFooter>
    </SheetContent>
  );
}

export function ItemFormSheet({ open, onOpenChange, item, categories, onSave }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open && (
        <ItemFormInner
          key={item?.id ?? 'new'}
          item={item}
          categories={categories}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />
      )}
    </Sheet>
  );
}
