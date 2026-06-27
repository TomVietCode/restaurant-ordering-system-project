'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { categoryService, itemService } from '@/services/menu.service';
import { ItemFormSheet } from './ItemFormSheet';
import type { Category, Item, ItemsPage } from '@/types/menu';

const PAGE_SIZE = 10;

function formatPrice(p: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
}

export function ItemList() {
  const [page, setPage] = useState<ItemsPage>({ items: [], page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [version, setVersion] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  const reload = useCallback(() => setVersion(v => v + 1), []);

  // Load categories once on mount
  useEffect(() => {
    let active = true;
    categoryService.getAll().then(data => { if (active) setCategories(data); });
    return () => { active = false; };
  }, []);

  // Fetch items when page, categoryId, or version changes
  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      try {
        const result = await itemService.getAll({
          page: currentPage, limit: PAGE_SIZE,
          search: search || undefined, categoryId,
        });
        if (active) setPage(result);
      } finally {
        if (active) setLoading(false);
      }
    }
    void run();
    return () => { active = false; };
  }, [currentPage, categoryId, version, search]); // search from closure is current when version bumps

  function handleSearchChange(val: string) {
    setSearch(val);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { reload(); }, 300);
  }

  function handleCategoryChange(val: string) {
    setCategoryId(val === 'ALL' ? undefined : Number(val));
    setCurrentPage(1);
  }

  async function handleSave(
    data: { name: string; price: number; categoryId: number; description: string; isRemain: boolean },
    id?: number,
  ) {
    const dto = {
      name: data.name.trim(),
      price: data.price,
      categoryId: data.categoryId,
      description: data.description.trim() || undefined,
      isRemain: data.isRemain,
    };
    if (id) {
      await itemService.update(id, dto);
      toast.success('Cập nhật món thành công');
    } else {
      await itemService.create(dto);
      toast.success('Thêm món thành công');
    }
    reload();
  }

  async function handleToggle(item: Item) {
    setToggling(prev => new Set(prev).add(item.id));
    try {
      await itemService.toggleAvailability(item.id, !item.isRemain);
      setPage(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === item.id ? { ...i, isRemain: !item.isRemain } : i),
      }));
    } catch {
      toast.error('Không thể thay đổi trạng thái');
    } finally {
      setToggling(prev => { const s = new Set(prev); s.delete(item.id); return s; });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await itemService.remove(deleteTarget.id);
      toast.success('Đã xóa món ăn');
      setDeleteTarget(null);
      reload();
    } catch {
      toast.error('Không thể xóa món ăn');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Tìm kiếm món ăn…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div> */}

        <Select
          value={categoryId ? String(categoryId) : 'ALL'}
          onValueChange={v => handleCategoryChange(v ?? 'ALL')}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả danh mục</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          className="ml-auto bg-primary text-primary-foreground hover:bg-primary-dark"
          onClick={() => { setEditing(null); setSheetOpen(true); }}
        >
          <Plus className="size-4" /> Thêm món mới
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Tên món</TableHead>
              <TableHead className="w-36">Danh mục</TableHead>
              <TableHead className="w-28 text-right">Giá</TableHead>
              <TableHead className="w-32 text-center">Trạng thái</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Đang tải…</TableCell>
              </TableRow>
            ) : page.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <UtensilsCrossed className="size-8 opacity-30" />
                    <span>Không có món nào</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              page.items.map((item, idx) => (
                <TableRow key={item.id} className={!item.isRemain ? 'opacity-60' : ''}>
                  <TableCell className="text-muted-foreground">
                    {(currentPage - 1) * PAGE_SIZE + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.category?.name ?? '—'}</TableCell>
                  <TableCell className="text-right font-medium">{formatPrice(item.price)}</TableCell>
                  <TableCell className="text-center">
                    <button
                      type="button" role="switch" aria-checked={item.isRemain}
                      disabled={toggling.has(item.id)}
                      onClick={() => handleToggle(item)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${item.isRemain ? 'bg-primary' : 'bg-input'}`}
                      title={item.isRemain ? 'Còn hàng' : 'Hết hàng'}
                    >
                      <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform ${item.isRemain ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {item.isRemain ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="size-8"
                        onClick={() => { setEditing(item); setSheetOpen(true); }}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}>
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

      {page.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{page.total} món &mdash; trang {page.page}/{page.totalPages}</span>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" className="size-8"
              disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button size="icon" variant="outline" className="size-8"
              disabled={currentPage >= page.totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <ItemFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        item={editing}
        categories={categories}
        onSave={handleSave}
      />

      <Dialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa món ăn</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa <strong>{deleteTarget?.name}</strong>? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
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
