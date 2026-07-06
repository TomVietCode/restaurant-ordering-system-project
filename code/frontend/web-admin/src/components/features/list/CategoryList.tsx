'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { categoryService } from '@/services/menu.service';
import { selectPage } from '@/lib/paginate';
import { toViError } from '@/lib/errors';
import type { Category, CreateCategoryDto } from '@/types/category';
import { CategoryFormDialog } from './CategoryFormDialog';
import { getCategoryColumns } from './categoryColumns';

const PAGE_SIZE = 10;

export function CategoryList() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [formOpen, setFormOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [delTarget, setDelTarget]   = useState<Category | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const load = useCallback(async () => {
    try {
      const cats = await categoryService.getAll();
      // BE trả về không đảm bảo thứ tự — sắp xếp mới nhất lên trước ở client
      const sorted = [...cats].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCategories(sorted);
    } catch {
      toast.error('Không thể lấy danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void (async () => { await load(); })(); }, [load]);

  async function handleSave(dto: CreateCategoryDto, id?: number) {
    if (id) {
      await categoryService.update(id, dto, token);
      toast.success('Sửa danh mục thành công');
    } else {
      await categoryService.create(dto, token);
      toast.success('Thêm danh mục mới thành công');
    }
    await load();
  }

  async function handleDelete() {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await categoryService.remove(delTarget.id, token);
      setCategories(prev => prev.filter(c => c.id !== delTarget.id));
      toast.success('Xóa danh mục thành công');
      setDelTarget(null);
    } catch (err) {
      toast.error(toViError(err, 'Không thể xóa danh mục. Vui lòng thử lại.'));
    } finally { setDeleting(false); }
  }

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const { total, page: curPage, rows: paged } = selectPage(filtered, page, PAGE_SIZE);

  const columns = getCategoryColumns({
    onCount: cat => router.push(`/menu?cat=${cat.id}`),
    onEdit: cat => { setEditTarget(cat); setFormOpen(true); },
    onDelete: setDelTarget,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Quản lý Danh mục</h1>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary-dark">
          <Plus className="size-4" /> Thêm danh mục
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Tìm tên danh mục..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <DataTable columns={columns} data={paged} loading={loading} emptyText="Chưa có danh mục nào" fixedLayout />

      {!loading && <Pagination page={curPage} pageSize={PAGE_SIZE} total={total} unit="danh mục" onPageChange={setPage} />}

      {/* Dialog thêm / sửa */}
      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editTarget} onSave={handleSave} />

      {/* Dialog xóa */}
      <ConfirmDialog
        open={!!delTarget}
        onOpenChange={v => { if (!v) setDelTarget(null); }}
        title="Xóa danh mục"
        description={<>Bạn có chắc muốn xóa <span className="font-semibold text-foreground">&quot;{delTarget?.name}&quot;</span>? Hành động này không thể hoàn tác.</>}
        confirmText="Xóa"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
