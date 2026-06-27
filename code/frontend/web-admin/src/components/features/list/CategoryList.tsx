'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { categoryService } from '@/services/menu.service';
import type { Category, CreateCategoryDto } from '@/types/menu';
import { CategoryFormDialog } from './CategoryFormDialog';

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategories(await categoryService.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(cat: Category) {
    setEditTarget(cat);
    setFormOpen(true);
  }

  function openDelete(cat: Category) {
    setDeleteTarget(cat);
    setDeleteError(null);
    setDeleteOpen(true);
  }

  async function handleSave(dto: CreateCategoryDto, id?: number) {
    if (id) {
      const updated = await categoryService.update(id, dto);
      setCategories(prev => prev.map(c => (c.id === id ? updated : c)));
    } else {
      const created = await categoryService.create(dto);
      setCategories(prev => [...prev, { ...created, itemCount: 0 }]);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await categoryService.remove(deleteTarget.id);
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteOpen(false);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Đang tải danh mục…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={load}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Danh mục</h2>
          <p className="text-sm text-muted-foreground">{categories.length} danh mục</p>
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      {/* Table */}
      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          Chưa có danh mục nào.{' '}
          <button className="text-primary hover:underline" onClick={openAdd}>
            Thêm ngay
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="w-12 px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tên danh mục</th>
                <th className="w-20 px-4 py-3 text-center font-medium text-muted-foreground">
                  Số món
                </th>
                <th className="w-28 px-4 py-3 text-right font-medium text-muted-foreground">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary">
                      {cat.itemCount ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Chỉnh sửa"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Xóa"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDelete(cat)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form dialog (add / edit) */}
      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editTarget}
        onSave={handleSave}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa danh mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa danh mục{' '}
              <span className="font-semibold text-foreground">
                &quot;{deleteTarget?.name}&quot;
              </span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {deleteError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Đang xóa…' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
