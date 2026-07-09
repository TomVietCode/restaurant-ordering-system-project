import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { staffService } from '@/services/staff.service';
import { toViError } from '@/lib/errors';
import { Role } from '@/types/auth';
import type { Staff, CreateStaffDto, UpdateStaffDto } from '@/types/staff';
import type { StaffFormDto } from './StaffFormDialog';

export const PAGE_SIZES = [5, 10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

export type RoleFilter = 'ALL' | Role;
export type ActiveFilter = 'ALL' | 'true' | 'false';

export function useStaffs() {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;
  const currentEmail = session?.user?.email ?? null;

  const [rows, setRows]       = useState<Staff[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  const [cur, setCur]           = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [search, setSearch]     = useState('');
  const [role, setRole]         = useState<RoleFilter>('ALL');
  const [active, setActive]     = useState<ActiveFilter>('ALL');

  const [formOpen, setFormOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState<Staff | null>(null);
  const [delTarget, setDelTarget]   = useState<Staff | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Staff | null>(null);
  const [toggling, setToggling]         = useState(false);

  const fetchPage = useCallback(async (page: number, q: string, r: RoleFilter, a: ActiveFilter, limit: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await staffService.getPage({
        page,
        limit,
        search: q.trim() || undefined,
        role: r === 'ALL' ? undefined : r,
        isActive: a === 'ALL' ? undefined : a === 'true',
      }, token);
      setRows(res.items);
      setTotal(res.total);
    } catch (ex) {
      toast.error(toViError(ex, 'Không thể tải danh sách nhân viên.'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { void fetchPage(cur, search, role, active, pageSize); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [token, cur, search, role, active, pageSize, fetchPage]);

  const onSearch         = (v: string) => { setSearch(v); setCur(1); };
  const onRoleChange     = (v: RoleFilter) => { setRole(v); setCur(1); };
  const onActiveChange   = (v: ActiveFilter) => { setActive(v); setCur(1); };
  const onPageChange     = (n: number) => setCur(n);
  const onPageSizeChange = (n: number) => { setPageSize(n); setCur(1); };

  function reload() { void fetchPage(cur, search, role, active, pageSize); }

  async function handleSave(dto: StaffFormDto, id?: number) {
    if (id) {
      // PATCH /users/:id nhận thẳng isActive
      await staffService.update(id, dto as UpdateStaffDto, token);
      toast.success('Cập nhật nhân viên thành công');
    } else {
      // POST /users không nhận isActive → tạo xong (mặc định hoạt động),
      // nếu form chọn "Đã khóa" thì gọi tiếp toggle-activate.
      const { isActive, ...createDto } = dto;
      const created = await staffService.create(createDto as CreateStaffDto, token);
      if (isActive === false) await staffService.toggleActivate(created.id, false, token);
      toast.success('Thêm nhân viên mới thành công');
    }
    reload();
  }

  async function handleToggle() {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      await staffService.toggleActivate(toggleTarget.id, !toggleTarget.isActive, token);
      toast.success(toggleTarget.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      setToggleTarget(null);
      reload();
    } catch (ex) {
      toast.error(toViError(ex, 'Không thể cập nhật trạng thái tài khoản.'));
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await staffService.remove(delTarget.id, token);
      toast.success('Xóa nhân viên thành công');
      setDelTarget(null);
      reload();
    } catch (ex) {
      toast.error(toViError(ex, 'Không thể xóa nhân viên.'));
    } finally {
      setDeleting(false);
    }
  }

  return {
    rows, total, loading, cur, pageSize, search, role, active, currentEmail,
    onSearch, onRoleChange, onActiveChange, onPageChange, onPageSizeChange,
    formOpen, setFormOpen, editTarget, setEditTarget, handleSave,
    delTarget, setDelTarget, deleting, handleDelete,
    toggleTarget, setToggleTarget, toggling, handleToggle,
  };
}
