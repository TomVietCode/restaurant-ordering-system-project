'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StaffFilters } from './StaffFilters';
import { StaffFormDialog } from './StaffFormDialog';
import { getStaffColumns } from './staffColumns';
import { useStaffs, DEFAULT_PAGE_SIZE } from './useStaffs';

export function StaffsPage() {
  const s = useStaffs();
  const columns = getStaffColumns({
    onEdit: staff => { s.setEditTarget(staff); s.setFormOpen(true); },
    onToggle: s.setToggleTarget,
    onDelete: s.setDelTarget,
    currentEmail: s.currentEmail,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Quản lý Nhân viên</h1>
        <Button onClick={() => { s.setEditTarget(null); s.setFormOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary-dark">
          <Plus className="size-4" /> Thêm nhân viên
        </Button>
      </div>

      <StaffFilters
        search={s.search} role={s.role} active={s.active} pageSize={s.pageSize}
        onSearch={s.onSearch} onRoleChange={s.onRoleChange} onActiveChange={s.onActiveChange}
        onPageSizeChange={s.onPageSizeChange}
      />

      <div className={s.loading && s.rows.length > 0 ? 'opacity-60 transition-opacity' : undefined}>
        <DataTable
          columns={columns}
          data={s.rows}
          loading={s.loading && s.rows.length === 0}
          emptyText="Chưa có nhân viên nào"
          rowClassName={staff => (s.currentEmail && staff.email === s.currentEmail ? 'bg-primary-light/90 hover:bg-primary-light' : undefined)}
        />
      </div>
      <Pagination page={s.cur} pageSize={s.pageSize || DEFAULT_PAGE_SIZE} total={s.total} unit="nhân viên" onPageChange={s.onPageChange} />

      <StaffFormDialog open={s.formOpen} onOpenChange={s.setFormOpen} staff={s.editTarget} onSave={s.handleSave} currentEmail={s.currentEmail} />

      <ConfirmDialog
        open={!!s.toggleTarget}
        onOpenChange={v => { if (!v) s.setToggleTarget(null); }}
        title={s.toggleTarget?.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        description={<>Bạn có chắc muốn {s.toggleTarget?.isActive ? 'khóa' : 'mở khóa'} tài khoản của <span className="font-semibold text-foreground">&quot;{s.toggleTarget?.fullName}&quot;</span>?</>}
        confirmText={s.toggleTarget?.isActive ? 'Khóa' : 'Mở khóa'}
        variant={s.toggleTarget?.isActive ? 'destructive' : 'default'}
        loading={s.toggling}
        onConfirm={s.handleToggle}
      />

      <ConfirmDialog
        open={!!s.delTarget}
        onOpenChange={v => { if (!v) s.setDelTarget(null); }}
        title="Xóa nhân viên"
        description={<>Bạn có chắc muốn xóa <span className="font-semibold text-foreground">&quot;{s.delTarget?.fullName}&quot;</span>? Hành động này không thể hoàn tác.</>}
        confirmText="Xóa"
        variant="destructive"
        loading={s.deleting}
        onConfirm={s.handleDelete}
      />
    </div>
  );
}
