'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Pencil, Plus, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { itemService } from '@/services/menu.service';
import { ImageUploader } from './ImageUploader';
import type { Category, Item } from '@/types/menu';

interface FormVals {
  name: string;
  price: number | '';
  categoryId: number;
  description: string;
  imageUrls: string[];
  isRemain: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: Item | null;
  categories: Category[];
  onSave: (v: { name: string; price: number; categoryId: number; description: string; imagesUrl: string[] | null; isRemain: boolean }, id?: number) => Promise<void>;
}

function toForm(item: Item | null): FormVals {
  return item
    ? { name: item.name, price: item.price, categoryId: item.categoryId, description: item.description ?? '', imageUrls: item.imagesUrl ?? [], isRemain: item.isRemain }
    : { name: '', price: '', categoryId: 0, description: '', imageUrls: [], isRemain: true };
}

function Inner({ item, categories, onOpenChange, onSave }: Omit<Props, 'open'>) {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;

  const [f, setF]                 = useState<FormVals>(toForm(item));
  const [err, setErr]             = useState<Partial<Record<keyof FormVals, string>>>({});
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const submittingRef = useRef(false); // lock đồng bộ, chặn double-submit chắc chắn hơn state loading

  function set<K extends keyof FormVals>(k: K, v: FormVals[K]) {
    setF(p => ({ ...p, [k]: v }));
    setErr(p => ({ ...p, [k]: undefined }));
  }

  // Cảnh báo (không chặn) nếu đã có món cùng tên trong cùng danh mục — vẫn cho phép thêm/sửa
  useEffect(() => {
    let active = true;
    const name = f.name.trim();
    const t = setTimeout(async () => {
      if (!active) return;
      if (!name || !f.categoryId) { setDupWarning(null); return; }
      try {
        const res = await itemService.getAll({ search: name, categoryId: f.categoryId, limit: 10 }, token);
        if (!active) return;
        const dup = res.items.find(i => i.id !== item?.id && i.name.trim().toLowerCase() === name.toLowerCase());
        setDupWarning(dup ? `Đã có món "${dup.name}" trong danh mục này` : null);
      } catch { /* không chặn người dùng nếu kiểm tra trùng lỗi */ }
    }, 400);
    return () => { active = false; clearTimeout(t); };
  }, [f.name, f.categoryId, item?.id, token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return; // đã có 1 submit đang chạy, bỏ qua click thêm
    const e2: typeof err = {};
    if (!f.name.trim())                        e2.name       = 'Tên món là bắt buộc';
    if (f.price === '' || Number(f.price) < 0) e2.price      = 'Giá phải ≥ 0';
    if (!f.categoryId)                         e2.categoryId = 'Chọn danh mục';
    if (Object.keys(e2).length) { setErr(e2); return; }
    submittingRef.current = true;
    setLoading(true);
    try {
      await onSave({
        name: f.name.trim(),
        price: Number(f.price),
        categoryId: f.categoryId,
        description: f.description.trim() || '',
        imagesUrl: f.imageUrls.length ? f.imageUrls : null,
        isRemain: f.isRemain,
      }, item?.id);
      onOpenChange(false);
    } catch {
      // Toast lỗi đã hiển thị ở useMenuItems.onSave — giữ dialog mở để user thử lại
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  const isEdit = !!item;
  const catLabel = categories.find(c => c.id === f.categoryId)?.name ?? 'Chọn danh mục';
  const isFormValid = f.name.trim() !== '' && f.price !== '' && Number(f.price) >= 0 && !!f.categoryId;

  return (
    <DialogContent className="sm:max-w-md" showCloseButton>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {isEdit
            ? <><Pencil className="size-4 text-primary" /> Chỉnh sửa món ăn</>
            : <><Plus className="size-4 text-primary" /> Thêm món mới</>}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-4 py-2">
        {/* Tên món */}
        <div className="space-y-1">
          <Label className="gap-0.5">Tên món <span className="text-destructive">*</span></Label>
          <Input value={f.name} onChange={e => set('name', e.target.value)}
            placeholder="VD: Cà phê sữa đá" autoFocus aria-invalid={!!err.name} />
          {err.name && <p className="text-xs text-destructive">{err.name}</p>}
          {!err.name && dupWarning && (
            <p className="flex items-center gap-1 text-xs text-warning">
              <TriangleAlert className="size-3.5 shrink-0" /> {dupWarning} — vẫn có thể thêm nếu chắc chắn
            </p>
          )}
        </div>

        {/* Danh mục + Giá — 1 dòng 2 cột */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="gap-0.5">Danh mục <span className="text-destructive">*</span></Label>
            <Select value={f.categoryId ? String(f.categoryId) : ''} onValueChange={v => v && set('categoryId', Number(v))}>
              <SelectTrigger className="w-full" aria-invalid={!!err.categoryId}>
                <span className={`flex-1 text-left text-sm ${!f.categoryId ? 'text-muted-foreground' : ''}`}>{catLabel}</span>
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {err.categoryId && <p className="text-xs text-destructive">{err.categoryId}</p>}
          </div>

          <div className="space-y-1">
            <Label className="gap-0.5">Giá (VND) <span className="text-destructive">*</span></Label>
            <Input type="number" min={0} value={f.price}
              onChange={e => set('price', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="VD: 29000" aria-invalid={!!err.price} />
            {err.price && <p className="text-xs text-destructive">{err.price}</p>}
          </div>
        </div>

        {/* Mô tả */}
        <div className="space-y-1">
          <Label>Mô tả <span className="text-muted-foreground font-normal text-xs">(tùy chọn)</span></Label>
          <Textarea rows={3} value={f.description} onChange={e => set('description', e.target.value)}
            placeholder="Mô tả ngắn về món ăn…" />
        </div>

        {/* Ảnh + Trạng thái — 1 dòng 2 cột */}
        <div className="grid grid-cols-2 gap-3">
          <ImageUploader
            value={f.imageUrls}
            onChange={urls => setF(p => ({ ...p, imageUrls: urls }))}
            token={token}
            onUploadingChange={setUploading}
          />

          {/* Trạng thái */}
          <div className="space-y-1">
            <Label>Trạng thái</Label>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">{f.isRemain ? 'Còn hàng' : 'Hết hàng'}</p>
                <p className="text-xs text-muted-foreground">{f.isRemain ? 'Khách có thể đặt' : 'Tạm ẩn khỏi menu'}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={f.isRemain}
                onClick={() => set('isRemain', !f.isRemain)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${f.isRemain ? 'bg-success' : 'bg-input'}`}
              >
                <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${f.isRemain ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading || uploading}>
            Hủy bỏ
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-dark" disabled={loading || uploading || !isFormValid}>
            {loading ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Thêm món'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export function ItemDialog({ open, onOpenChange, item, categories, onSave }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <Inner key={item?.id ?? 'new'} item={item} categories={categories} onOpenChange={onOpenChange} onSave={onSave} />}
    </Dialog>
  );
}
