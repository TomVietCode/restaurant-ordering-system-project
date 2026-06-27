'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Search, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { itemService } from '@/services/menu.service';
import { ItemFormSheet } from './ItemFormSheet';
import { ItemCard } from './ItemCard';
import type { Category, Item, ItemsPage } from '@/types/menu';

type StatusFilter = 'ALL' | 'REMAIN' | 'OUT';

interface Props {
  selectedCategoryId: number | null;
  selectedCategoryName: string | null;
  categories: Category[];
}

const PAGE_SIZE = 20;

export function ItemGrid({ selectedCategoryId, selectedCategoryName, categories }: Props) {
  const [page, setPage] = useState<ItemsPage>({ items: [], page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [version, setVersion] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef(search);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  const reload = useCallback(() => setVersion(v => v + 1), []);

  // Initial load + reload on version bump.
  // selectedCategoryId is captured from props at mount (remount via key when it changes).
  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      try {
        const result = await itemService.getAll({
          page: 1,
          limit: PAGE_SIZE,
          search: searchRef.current || undefined,
          categoryId: selectedCategoryId ?? undefined,
        });
        if (active) setPage(result);
      } finally {
        if (active) setLoading(false);
      }
    }
    void run();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]); // selectedCategoryId is stable per-mount (parent uses key to remount on change)

  function handleSearchChange(val: string) {
    setSearch(val);
    searchRef.current = val; // update ref in handler (allowed outside render)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      reload();
    }, 300);
  }

  const visibleItems = page.items.filter(item => {
    if (statusFilter === 'REMAIN') return item.isRemain;
    if (statusFilter === 'OUT') return !item.isRemain;
    return true;
  });

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

  // const searchPlaceholder = selectedCategoryName
  //   ? `Tìm món trong '${selectedCategoryName}'...`
  //   : 'Tìm kiếm món ăn...';

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* <div className="relative min-w-48 flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div> */}

        <Select
          value={statusFilter}
          onValueChange={v => setStatusFilter((v ?? 'ALL') as StatusFilter)}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Trạng thái: Tất cả</SelectItem>
            <SelectItem value="REMAIN">Còn hàng</SelectItem>
            <SelectItem value="OUT">Hết hàng</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="ml-auto bg-primary text-primary-foreground hover:bg-primary-dark"
          onClick={() => { setEditing(null); setSheetOpen(true); }}
        >
          <Plus className="size-4" /> Thêm món
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <UtensilsCrossed className="mb-3 size-10 opacity-25" />
          <p className="text-sm">Không có món nào</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={i => { setEditing(i); setSheetOpen(true); }}
              onDelete={i => setDeleteTarget(i)}
              onToggle={handleToggle}
              toggling={toggling.has(item.id)}
            />
          ))}
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
