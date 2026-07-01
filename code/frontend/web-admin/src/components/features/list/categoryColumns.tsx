import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ColumnDef } from '@/components/ui/data-table';
import type { Category } from '@/types/category';

interface Args {
  onCount: (cat: Category) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

export function getCategoryColumns({ onCount, onEdit, onDelete }: Args): ColumnDef<Category>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Tên danh mục',
      meta: { className: 'w-[33.33%] pl-6' },
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
    },
    {
      id: 'itemCount',
      header: 'Số lượng món',
      meta: { className: 'w-[22.22%] text-center' },
      cell: ({ row }) => (
        <button className="text-primary hover:underline" onClick={() => onCount(row.original)}>
          {row.original.totalItem ?? 0} món
        </button>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      meta: { className: 'w-[22.22%] text-center' },
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Thao tác</div>,
      meta: { className: 'w-[22.22%] pr-6' },
      cell: ({ row }) => {
        const cat = row.original;
        return (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(cat)}>
              <Pencil className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(cat)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
