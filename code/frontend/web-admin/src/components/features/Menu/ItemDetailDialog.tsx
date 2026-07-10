'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Item } from '@/types/menu';
import { formatVnDateTime } from '@/lib/datetime';

interface Props {
  item: Item | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const fmtPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + ' đ';

const fmtDate = (s: string) => formatVnDateTime(s);

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const hasMultiple = images.length > 1;

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-lg border border-border bg-secondary">
      {images.length > 0 ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[idx]} alt={`${alt} - ảnh ${idx + 1}`} className="h-full w-full object-cover" />
          {hasMultiple && (
            <>
              <button
                type="button"
                aria-label="Ảnh trước"
                onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Ảnh sau"
                onClick={() => setIdx(i => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
              >
                <ChevronRight className="size-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Xem ảnh ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className={`size-1.5 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <ImageIcon className="size-10 text-muted-foreground/40" />
        </div>
      )}
    </div>
  );
}

export function ItemDetailDialog({ item, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Chi tiết món ăn</DialogTitle>
        </DialogHeader>

        {item && (
          <div key={item.id} className="space-y-4">
            <ImageCarousel images={item.imagesUrl ?? []} alt={item.name} />

            {/* Tên + trạng thái */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${item.isRemain ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {item.isRemain ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>

            {/* Danh mục + giá */}
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                {item.category?.name ?? '—'}
              </span>
              <span className="text-lg font-semibold text-primary">{fmtPrice(item.price)}</span>
            </div>

            {/* Mô tả */}
            <div className="space-y-1 rounded-lg bg-secondary/40 p-3">
              <p className="text-xs font-medium text-muted-foreground">Mô tả</p>
              <p className="text-sm text-foreground">{item.description?.trim() || 'Không có mô tả'}</p>
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">Ngày tạo</p>
                <p>{fmtDate(item.createdAt)}</p>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="font-medium text-foreground">Cập nhật lần cuối</p>
                <p>{fmtDate(item.updatedAt)}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
