'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { categoryService } from '@/services/menu.service';
import { CategoryFormDialog } from './CategoryFormDialog';
import type { Category } from '@/types/menu';

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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
        const data = await categoryService.getAll();
        if (active) setCategories(data);
      } finally {
        if (active) setLoading(false);
      }
    }
    void run();
    return () => { active = false; };
  }, [version]);

  function openAdd() { setEditing(null); setFormOpen(true); }
  function openEdit(cat: Category) { setEditing(cat); setFormOpen(true); }

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

  function openDelete(cat: Category) { setDeleteTarget(cat); setDeleteError(''); }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await categoryService.remove(deleteTarget.id);
      toast.success('Đã xóa danh mục');
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
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} danh mục</p>
        <Button onClick={openAdd} className="bg-primary text-primary-foreground hover:bg-primary-dark">
          <Plus className="size-4" /> Thêm danh mục
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Tên danh mục</TableHead>
              <TableHead className="w-28 text-center">Số món</TableHead>
              <TableHead className="w-28 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">Đang tải…</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">Chưa có danh mục nào</TableCell>
              </TableRow>
            ) : (
              categories.map((cat, idx) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{cat.itemCount ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(cat)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon" variant="ghost"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => openDelete(cat)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
              Bạn có chắc muốn xóa danh mục <strong>{deleteTarget?.name}</strong>? Hành động này không thể hoàn tác.
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
