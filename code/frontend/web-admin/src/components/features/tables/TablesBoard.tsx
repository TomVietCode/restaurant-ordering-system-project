'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { tableService } from '@/services/table.service';
import { TableCard } from './TableCard';
import { TableFormDialog } from './TableFormDialog';
import { API_BASE_URL } from '@/lib/constants';
import type { Table, TableStatus } from '@/types/table';

type Filter = 'ALL' | TableStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL',       label: 'Tất cả'   },
  { value: 'AVAILABLE', label: 'Trống'    },
  { value: 'CLOSED',    label:'Đóng'},
  { value: 'OCCUPIED',  label: 'Có khách' },
];

export function TablesBoard() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tables, setTables]             = useState<Table[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  // Đọc filter từ URL, fallback về 'ALL'
  const VALID_FILTERS: Filter[] = ['ALL', 'AVAILABLE', 'CLOSED', 'OCCUPIED'];
  const rawFilter = searchParams.get('filter') ?? 'ALL';
  const filter = (VALID_FILTERS.includes(rawFilter as Filter) ? rawFilter : 'ALL') as Filter;

  function setFilter(value: Filter) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') params.delete('filter');
    else params.set('filter', value);
    router.replace(`?${params.toString()}`, { scroll: false });
  }
  const [formTarget, setFormTarget]     = useState<Table | 'new' | null>(null); // 'new' = thêm, Table = sửa
  const [deleteTarget, setDeleteTarget] = useState<Table | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Table | null>(null);
  const [toggling, setToggling]         = useState(false);

  const loadTables = useCallback(async () => {
    // Defer state updates to the next microtask to prevent synchronous setState within the effect
    await Promise.resolve();

    setLoading(true);
    setError(null);
    try {
      setTables(await tableService.getAll(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được danh sách bàn');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      Promise.resolve().then(() => loadTables());
    }
  }, [token, loadTables]);

  // Lắng nghe realtime khi cashier thanh toán → bàn tự đổi trạng thái
  useEffect(() => {
    const WS_URL = API_BASE_URL.replace('/api', '');
    const socket = io(`${WS_URL}/orders`, { transports: ['websocket'] });

    socket.on('table:status-changed', ({ tableId, status }: { tableId: string; status: TableStatus }) => {
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
    });

    return () => { socket.disconnect(); };
  }, []);

  async function handleToggle() {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      const updated = await tableService.toggleStatus(token, toggleTarget.id);
      setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success(updated.status === 'AVAILABLE' ? 'Đã mở bàn' : 'Đã đóng bàn');
      setToggleTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Thao tác thất bại');
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tableService.remove(token, deleteTarget.id);
      setTables(prev => prev.filter(t => t.id !== deleteTarget.id));
      toast.success('Xóa bàn thành công');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  }

  // Cập nhật danh sách sau khi thêm/sửa
  function handleFormDone(saved: Table) {
    setTables(prev =>
      prev.some(t => t.id === saved.id)
        ? prev.map(t => t.id === saved.id ? saved : t) // sửa
        : [...prev, saved],                             // thêm mới
    );
  }

  // Newest tables first — mirrors the backend ordering and stays fixed.
  const visibleTables = (filter === 'ALL' ? tables : tables.filter(t => t.status === filter))
    .slice()
    .sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0));

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-sm text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <p className="text-sm text-destructive">Không tìm thấy dữ liệu</p>
        <Button variant="outline" size="sm" onClick={loadTables}>Thử lại</Button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Quản lý bàn</h2>
          <p className="text-sm text-muted-foreground">{tables.length} bàn</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Bộ lọc */}
          <div className="flex gap-1 rounded-lg border bg-secondary p-1">
            {FILTERS.map(f => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? 'default' : 'ghost'}
                className={cn(
                  'rounded-md text-xs',
                  filter === f.value
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-dark'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary-dark"
            onClick={() => setFormTarget('new')}
          >
            <Plus className="size-4" /> Thêm bàn
          </Button>
        </div>
      </div>

      {/* Grid bàn */}
      {visibleTables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">Không có bàn nào</p>
          {filter === 'ALL' && (
            <button
              className="mt-1 text-sm text-primary hover:underline"
              onClick={() => setFormTarget('new')}
            >
              Thêm ngay
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleTables.map(t => (
            <TableCard
              key={t.id}
              table={t}
              onEdit={() => setFormTarget(t)}
              onDelete={() => setDeleteTarget(t)}
              onToggle={() => setToggleTarget(t)}
            />
          ))}
        </div>
      )}

      {/* Dialog thêm / sửa bàn */}
      <TableFormDialog
        open={formTarget !== null}
        onOpenChange={v => { if (!v) setFormTarget(null); }}
        table={formTarget !== 'new' ? formTarget : null}
        existingNames={tables.map(t => t.name)}
        onDone={handleFormDone}
      />

      {/* Dialog xác nhận toggle trạng thái */}
      <Dialog open={!!toggleTarget} onOpenChange={v => { if (!v) setToggleTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {toggleTarget?.status === 'AVAILABLE' ? 'Đóng bàn' : 'Mở bàn'}
            </DialogTitle>
            <DialogDescription>
              Xác nhận{' '}
              <span className="font-semibold text-foreground">
                {toggleTarget?.status === 'AVAILABLE' ? 'đóng' : 'mở'}
              </span>{' '}
              bàn &quot;{toggleTarget?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={toggling} onClick={() => setToggleTarget(null)}>
              Hủy
            </Button>
            <Button disabled={toggling} onClick={handleToggle}>
              {toggling ? 'Đang xử lý…' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa bàn</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa{' '}
              <span className="font-semibold text-foreground">
                &quot;{deleteTarget?.name}&quot;
              </span>?
              {' '}Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={deleting} onClick={() => setDeleteTarget(null)}>
              Hủy
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Đang xóa…' : 'Xóa bàn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
