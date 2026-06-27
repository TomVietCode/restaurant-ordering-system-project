'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Coffee, UtensilsCrossed, IceCream, Tag, Layers, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { categoryService } from '@/services/menu.service';
import { CategoryFormDialog } from './CategoryFormDialog';
import type { Category } from '@/types/menu';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = [Coffee, UtensilsCrossed, IceCream, Tag, Layers];

interface Props {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onCategoriesChange?: (cats: Category[]) => void;
}

export function CategorySidebar({ selectedId, onSelect, onCategoriesChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [version, setVersion] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const reload = useCallback(() => setVersion(v => v + 1), []);

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      try {
        const cats = await categoryService.getAll();
        if (active) {
          setCategories(cats);
          onCategoriesChange?.(cats);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void run();
    return () => { active = false; };
  }, [version, onCategoriesChange]);

  function getIcon(idx: number) {
    const Icon = CATEGORY_ICONS[idx % CATEGORY_ICONS.length];
    return <Icon className="size-4 shrink-0" />;
  }

  async function handleSave(name: string, id?: number) {
    if (id) {
      await categoryService.update(id, { name });
      toast.success('Đã cập nhật danh mục');
    } else {
      await categoryService.create({ name });
      toast.success('Thêm danh mục thành công');
    }
    reload();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await categoryService.remove(deleteTarget.id);
      toast.success('Đã xóa danh mục');
      if (selectedId === deleteTarget.id) onSelect(null);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <div className="flex w-56 shrink-0 flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-medium text-foreground">Danh mục</span>
          <Button
            size="sm" variant="ghost"
            className="h-7 gap-1 px-2 text-xs text-primary hover:text-primary"
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            <Plus className="size-3" /> Thêm
          </Button>
        </div>

        <div className="flex flex-col gap-0.5">
          {loading ? (
            <div className="py-6 text-center text-xs text-muted-foreground">Đang tải…</div>
          ) : (
            categories.map((cat, idx) => {
              const isActive = selectedId === cat.id;
              const isHovered = hoveredId === cat.id;
              return (
                <div
                  key={cat.id}
                  className={cn(
                    'group relative flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all',
                    isActive
                      ? 'border-primary/30 bg-primary/5 text-primary'
                      : 'border-transparent hover:border-border hover:bg-secondary/60 text-foreground',
                  )}
                  onClick={() => onSelect(isActive ? null : cat.id)}
                  onMouseEnter={() => setHoveredId(cat.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <span className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}>
                    {getIcon(idx)}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium">{cat.name}</span>
                  <span className={cn(
                    'shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums',
                    isActive ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground',
                  )}>
                    {cat.itemCount ?? 0}
                  </span>

                  {(isHovered || isActive) && (
                    <div className="absolute right-1.5 flex gap-0.5" onClick={e => e.stopPropagation()}>
                      <button
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => { setEditing(cat); setFormOpen(true); }}
                        title="Sửa tên"
                      >
                        <Pencil className="size-3" />
                      </button>
                      <button
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => { setDeleteTarget(cat); setDeleteError(''); }}
                        title="Xoá"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          onClick={() => { setEditing(null); setFormOpen(true); }}
        >
          <Plus className="size-3" />
          <span>danh mục mới…</span>
        </button>

        <p className="px-1 text-[11px] leading-normal text-muted-foreground/70">
          Mỗi danh mục: Sửa tên&nbsp;/&nbsp;Xoá (xoá phải xử lý món bên trong)
        </p>
      </div>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        onSave={handleSave}
      />

      <Dialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa danh mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa danh mục <strong>{deleteTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{deleteError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={deleteLoading} onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Đang xóa…' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
