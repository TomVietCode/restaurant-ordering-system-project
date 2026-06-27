'use client';

import Image from 'next/image';
import { ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Item } from '@/types/menu';

interface Props {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onToggle: (item: Item) => void;
  toggling?: boolean;
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('vi-VN').format(p) + 'đ';
}

export function ItemCard({ item, onEdit, onDelete, onToggle, toggling }: Props) {
  const img = item.imagesUrl?.[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-sm">
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        {img ? (
          <Image src={img} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="size-10 text-muted-foreground/30" />
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${
            item.isRemain ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}
        >
          {item.isRemain ? '● Còn hàng' : '● Hết hàng'}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p
          className={`line-clamp-1 text-sm font-medium ${!item.isRemain ? 'text-muted-foreground' : 'text-foreground'}`}
          title={item.name}
        >
          {item.name}
        </p>
        <p className={`text-sm font-semibold ${!item.isRemain ? 'text-muted-foreground line-through' : 'text-primary'}`}>
          {formatPrice(item.price)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-border px-3 py-2">
        <button
          type="button"
          disabled={toggling}
          onClick={() => onToggle(item)}
          className="h-6 flex-none"
          title={item.isRemain ? 'Đánh dấu hết hàng' : 'Đánh dấu còn hàng'}
        >
          <span className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${item.isRemain ? 'bg-primary' : 'bg-input'}`}>
            <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform ${item.isRemain ? 'translate-x-4' : 'translate-x-0'}`} />
          </span>
        </button>

        <div className="flex flex-1 gap-1.5">
          <Button size="sm" variant="outline" className="h-7 flex-1 text-xs" onClick={() => onEdit(item)}>
            <Pencil className="size-3" /> Sửa
          </Button>
          <Button
            size="sm" variant="outline"
            className="h-7 flex-1 border-destructive/30 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="size-3" /> Xoá
          </Button>
        </div>
      </div>
    </div>
  );
}
