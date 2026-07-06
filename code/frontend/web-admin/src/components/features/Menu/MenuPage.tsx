'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ItemDialog } from './ItemDialog';
import { ItemDetailDialog } from './ItemDetailDialog';
import { MenuFilters } from './MenuFilters';
import { getMenuColumns } from './menuColumns';
import { useMenuItems } from './useMenuItems';

export function MenuPage() {
  const m = useMenuItems();

  const columns = getMenuColumns({
    onToggleClick: m.onToggleClick,
    onView: m.setDetailTarget,
    onEdit: item => { m.setEditing(item); m.setSheet(true); },
    onDelete: m.setDel,
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Quản lý Menu</h1>
        <Button onClick={() => { m.setEditing(null); m.setSheet(true); }} className="bg-primary text-primary-foreground hover:bg-primary-dark">
          <Plus className="size-4" /> Thêm món mới
        </Button>
      </div>

      <MenuFilters
        search={m.search} catId={m.catId} status={m.status} price={m.price} pageSize={m.pageSize} cats={m.cats}
        onSearch={m.onSearch} onCatChange={m.onCatChange} onPriceChange={m.onPriceChange} onStatusChange={m.onStatusChange}
        onPageSizeChange={m.onPageSizeChange}
      />

      {/*
        Chỉ hiện "Đang tải…" (thay hẳn bảng) khi CHƯA có data nào (lần đầu vào trang).
        Từ lần fetch thứ 2 trở đi (đổi trang/lọc), giữ nguyên bảng cũ + làm mờ nhẹ
        thay vì chớp qua "Đang tải…" rồi lại hiện data — tránh hiệu ứng nháy.
      */}
      <div className={m.loading && m.visible.length > 0 ? 'opacity-60 transition-opacity' : undefined}>
        <DataTable columns={columns} data={m.visible} loading={m.loading && m.visible.length === 0} emptyText="Không có món nào" fixedLayout />
      </div>

      <Pagination page={m.cur} pageSize={m.pageSize} total={m.data.total} unit="món" onPageChange={m.onPageChange} />

      <ItemDialog open={m.sheet} onOpenChange={m.setSheet} item={m.editing} categories={m.cats} onSave={m.onSave} />

      <ItemDetailDialog item={m.detailTarget} open={!!m.detailTarget} onOpenChange={v => { if (!v) m.setDetailTarget(null); }} />

      <ConfirmDialog
        open={!!m.delTarget}
        onOpenChange={v => { if (!v) m.setDel(null); }}
        title="Xóa món ăn"
        description={<>Bạn có chắc muốn xóa <strong>{m.delTarget?.name}</strong>?</>}
        confirmText="Xóa"
        variant="destructive"
        loading={m.delLoading}
        onConfirm={m.onDelete}
      />

      <ConfirmDialog
        open={!!m.toggleTarget}
        onOpenChange={v => { if (!v) m.setToggleTarget(null); }}
        title="Đổi trạng thái món"
        description={
          <>Bạn có chắc muốn đổi <strong>{m.toggleTarget?.name}</strong> sang{' '}
          <strong>{m.toggleTarget?.isRemain ? 'Hết hàng' : 'Còn hàng'}</strong>?</>
        }
        loading={m.toggleLoading}
        onConfirm={m.confirmToggle}
      />
    </div>
  );
}
