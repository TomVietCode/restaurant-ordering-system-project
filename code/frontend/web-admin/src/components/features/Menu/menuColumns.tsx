import Image from 'next/image';
import { Eye, ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ColumnDef } from '@/components/ui/data-table';
import type { Item } from '@/types/menu';

const fmt = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + ' đ';

interface Args {
  onToggleClick: (item: Item) => void;
  onView: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export function getMenuColumns({ onToggleClick, onView, onEdit, onDelete }: Args): ColumnDef<Item>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Tên món',
      meta: { className: 'w-[34%] pl-6' },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-secondary">
              {item.imagesUrl?.[0]
                ? <Image src={item.imagesUrl[0]} alt={item.name} fill className="object-cover" unoptimized />
                : <div className="flex size-full items-center justify-center bg-secondary"><ImageIcon className="size-4 text-muted-foreground/40" /></div>}
            </div>
            <div>
              <p className="font-medium text-foreground">{item.name}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'categoryId',
      header: 'Danh mục',
      meta: { className: 'w-[16%]' },
      cell: ({ row }) => (
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
          {row.original.category?.name ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'price',
      header: () => <div className="text-right">Giá bán</div>,
      meta: { className: 'w-[16%]' },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className={`text-right font-medium ${!item.isRemain ? 'line-through text-muted-foreground' : ''}`}>
            {fmt(item.price)}
          </div>
        );
      },
    },
    {
      accessorKey: 'isRemain',
      header: () => <div className="text-center">Trạng thái</div>,
      meta: { className: 'w-[18%]' },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <button type="button" role="switch" aria-checked={item.isRemain}
              onClick={() => onToggleClick(item)}
              className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${item.isRemain ? 'bg-success' : 'bg-input'}`}>
              <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${item.isRemain ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className="text-xs text-muted-foreground">{item.isRemain ? 'Còn hàng' : 'Hết hàng'}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Thao tác</div>,
      meta: { className: 'w-[16%] pr-6' },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => onView(item)} title="Xem chi tiết">
              <Eye className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(item)} title="Sửa">
              <Pencil className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(item)} title="Xóa">
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
