'use client';

// ─────────────────────────────────────────────────────────────────────────────
// StaffBoard.tsx — Component cha quản lý toàn bộ state của tính năng Staff
// Orchestrates: StaffTable, StaffFormModal, StaffConfirmDelete
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import {
  UserRole,
  MOCK_STAFF_LIST,
  PAGE_SIZE,
  type IUser,
  type StatusFilter,
} from './types';
import { StaffTable } from './StaffTable';
import { AddStaffModal, EditStaffModal } from './StaffFormModal';
import { StaffConfirmDelete } from './StaffConfirmDelete';

export function StaffBoard() {
  const { data: session } = useSession();

  // ID của Owner đang đăng nhập — dùng để áp dụng AC-04
  // NOTE: session.user.id là string theo Auth.js, chuyển sang number để so sánh với IUser.id
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  // ── State chính ──────────────────────────────────────────────────────────
  const [staffList, setStaffList] = useState<IUser[]>(MOCK_STAFF_LIST);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Modal states ─────────────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<IUser | null>(null);
  /** deletingStaff lưu nhân viên đang chờ xác nhận xóa (null = dialog đóng) */
  const [deletingStaff, setDeletingStaff] = useState<IUser | null>(null);

  // ── Debounce tìm kiếm 300ms ──────────────────────────────────────────────
  // Tránh gọi filter/API liên tục mỗi keystroke
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchInput.trim().toLowerCase());
      setCurrentPage(1); // Reset về trang 1 mỗi khi từ khóa thay đổi
    }, 300);
    return () => clearTimeout(timerId);
  }, [searchInput]);

  // ── Lọc danh sách theo từ khóa và trạng thái ────────────────────────────
  const filteredList = useMemo(() => {
    return staffList.filter((staff) => {
      const matchesSearch =
        debouncedSearch === '' ||
        staff.fullName.toLowerCase().includes(debouncedSearch) ||
        staff.email.toLowerCase().includes(debouncedSearch);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && staff.isActive) ||
        (statusFilter === 'inactive' && !staff.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [staffList, debouncedSearch, statusFilter]);

  // ── Phân trang local ─────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage]);

  // Reset trang về 1 khi filter thay đổi
  // NOTE: @base-ui/react Select truyền value có type `string | null` vào onValueChange
  const handleStatusFilterChange = useCallback((value: string | null) => {
    setStatusFilter((value ?? 'all') as StatusFilter);
    setCurrentPage(1);
  }, []);

  // ── Xử lý toggle trạng thái (AC-03, AC-04) ───────────────────────────────
  const handleToggleStatus = useCallback(
    (id: number, newStatus: boolean) => {
      const target = staffList.find((s) => s.id === id);

      // Chặn vô hiệu hóa tài khoản OWNER (guard ở tầng state)
      if (target?.role === UserRole.OWNER) {
        toast.error('Tài khoản Owner không thể bị vô hiệu hóa.');
        return;
      }

      // AC-04: Chặn Owner tự khóa chính mình
      if (id === currentUserId) {
        toast.error('Không thể vô hiệu hóa tài khoản đang đăng nhập.');
        return;
      }

      setStaffList((prev) =>
        prev.map((staff) =>
          staff.id === id ? { ...staff, isActive: newStatus } : staff,
        ),
      );

      const message = newStatus ? 'Đã kích hoạt tài khoản.' : 'Đã vô hiệu hóa tài khoản.';
      toast.success(message);
    },
    [currentUserId, staffList],
  );

  // ── Xử lý thêm nhân viên mới (AC-01, AC-02) ─────────────────────────────
  const handleAddStaff = useCallback(
    (data: Omit<IUser, 'id'> & { password: string }) => {
      // Kiểm tra trùng email lần cuối ở tầng state (phòng race condition)
      const emailExists = staffList.some(
        (s) => s.email.toLowerCase() === data.email.toLowerCase(),
      );
      if (emailExists) {
        toast.error('Email đã được sử dụng.');
        return;
      }

      const newId = Math.max(...staffList.map((s) => s.id)) + 1;
      const newStaff: IUser = {
        id: newId,
        email: data.email,
        role: data.role,
        fullName: data.fullName,
        phone: data.phone,
        isActive: data.isActive,
      };

      setStaffList((prev) => [newStaff, ...prev]);
      setIsAddModalOpen(false);
      toast.success(`Đã thêm nhân viên "${data.fullName}" thành công.`);
    },
    [staffList],
  );

  // ── Xử lý chỉnh sửa nhân viên ───────────────────────────────────────────
  const handleEditStaff = useCallback((updated: IUser) => {
    setStaffList((prev) =>
      prev.map((staff) => (staff.id === updated.id ? updated : staff)),
    );
    setEditingStaff(null);
    toast.success(`Đã cập nhật thông tin nhân viên "${updated.fullName}".`);
  }, []);

  // ── Xử lý xóa nhân viên ─────────────────────────────────────────────────
  const handleConfirmDelete = useCallback(() => {
    if (!deletingStaff) return;

    // Lọc nhân viên ra khỏi danh sách state
    setStaffList((prev) => prev.filter((s) => s.id !== deletingStaff.id));
    toast.success(`Đã xóa nhân viên "${deletingStaff.fullName}" thành công.`);
    setDeletingStaff(null);
    // Nếu trang hiện tại không còn dữ liệu sau khi xóa, lùi về trang trước
    setCurrentPage((prev) => Math.max(1, prev));
  }, [deletingStaff]);

  // Danh sách email hiện có để validate trong modal (tránh trùng)
  const existingEmails = useMemo(
    () => staffList.map((s) => s.email.toLowerCase()),
    [staffList],
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── 1. Page Header ────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h1 font-bold text-foreground">Quản lý Nhân viên</h1>
        <Button
          id="btn-add-staff"
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-dark"
        >
          <PlusIcon className="size-4" aria-hidden="true" />
          Thêm nhân viên
        </Button>
      </div>

      {/* ── 2. Bảng nhân viên (filter + table + pagination) ───────────── */}
      <StaffTable
        paginatedList={paginatedList}
        filteredCount={filteredList.length}
        currentUserId={currentUserId}
        searchInput={searchInput}
        statusFilter={statusFilter}
        currentPage={currentPage}
        totalPages={totalPages}
        onSearchChange={setSearchInput}
        onStatusFilterChange={handleStatusFilterChange}
        onPageChange={setCurrentPage}
        onToggleStatus={handleToggleStatus}
        onEdit={setEditingStaff}
        onDelete={setDeletingStaff}
      />

      {/* ── 3. Modal thêm nhân viên ───────────────────────────────────── */}
      <AddStaffModal
        open={isAddModalOpen}
        existingEmails={existingEmails}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStaff}
      />

      {/* ── 4. Modal chỉnh sửa nhân viên ─────────────────────────────── */}
      <EditStaffModal
        staff={editingStaff}
        existingEmails={existingEmails}
        onClose={() => setEditingStaff(null)}
        onSubmit={handleEditStaff}
      />

      {/* ── 5. Dialog xác nhận xóa nhân viên ─────────────────────────── */}
      <StaffConfirmDelete
        staff={deletingStaff}
        onCancel={() => setDeletingStaff(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
