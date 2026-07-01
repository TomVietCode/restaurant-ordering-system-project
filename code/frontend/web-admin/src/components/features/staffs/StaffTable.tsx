'use client';

// ─────────────────────────────────────────────────────────────────────────────
// StaffTable.tsx — Thanh tìm kiếm/lọc + Bảng danh sách nhân viên + Phân trang
// Nhận toàn bộ dữ liệu đã lọc/phân trang và các callback từ StaffBoard.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import {
  SearchIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  UserRole,
  PAGE_SIZE,
  getAvatarInitials,
  type IUser,
  type StatusFilter,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE SUB-COMPONENTS (chỉ dùng nội bộ trong file này)
// ─────────────────────────────────────────────────────────────────────────────

/** Avatar hình tròn với màu Primary của hệ thống */
function StaffAvatar({ fullName }: { fullName: string }) {
  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
      aria-hidden="true"
    >
      {getAvatarInitials(fullName)}
    </div>
  );
}

/** Badge vai trò — Chủ quán (terracotta) / Nhân viên (xanh nhạt) */
function RoleBadge({ role }: { role: UserRole }) {
  const isOwner = role === UserRole.OWNER;
  return (
    <span
      className={[
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        isOwner
          ? 'bg-primary-light text-accent-foreground'
          : 'bg-status-new text-status-new-foreground',
      ].join(' ')}
    >
      {isOwner ? 'Chủ quán' : 'Nhân viên'}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS TOGGLE
// Điều kiện disable (không cho toggle):
//   • isSelf  — tài khoản đang đăng nhập (AC-04: chặn tự khóa)
//   • isOwner — tài khoản có vai trò OWNER (không được phép bị vô hiệu hóa)
// ─────────────────────────────────────────────────────────────────────────────
interface StatusToggleProps {
  staffId: number;
  isActive: boolean;
  isOwner: boolean;
  isSelf: boolean;
  onToggle: (id: number, newStatus: boolean) => void;
}

function StatusToggle({ staffId, isActive, isOwner, isSelf, onToggle }: StatusToggleProps) {
  const isDisabled = isOwner || isSelf;

  const tooltipMessage = isSelf
    ? 'Không thể vô hiệu hóa tài khoản đang đăng nhập.'
    : 'Tài khoản Owner không thể bị vô hiệu hóa.';

  const handleClick = () => {
    if (isDisabled) return;
    onToggle(staffId, !isActive);
  };

  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={isActive ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
      disabled={isDisabled}
      onClick={handleClick}
      className={[
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive ? 'bg-success' : 'bg-muted-foreground',
        isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
          isActive ? 'translate-x-4' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );

  // Bọc trong Tooltip khi bị khóa để giải thích lý do cho người dùng
  if (isDisabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          {/* span wrapper để Tooltip nhận sự kiện ngay cả khi button disabled */}
          <TooltipTrigger render={<span className="inline-flex" />}>
            {toggle}
          </TooltipTrigger>
          <TooltipContent side="top">
            {tooltipMessage}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return toggle;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages = useMemo(() => {
    const result: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      result.push(i);
    }
    return result;
  }, [totalPages]);

  if (totalPages <= 1 && totalItems === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-primary">
        Hiện thị {startItem}-{endItem} trên {totalItems} nhân viên
      </p>

      {totalPages > 1 && (
        <nav aria-label="Phân trang danh sách nhân viên" className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Trang trước"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-sm text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>

          {pages.map((page) => (
            <button
              key={page}
              type="button"
              aria-label={`Trang ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              onClick={() => onPageChange(page)}
              className={[
                'flex size-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                page === currentPage
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted',
              ].join(' ')}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            aria-label="Trang sau"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-sm text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF TABLE — MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

interface StaffTableProps {
  /** Danh sách nhân viên đã phân trang (đã slice sẵn từ StaffBoard) */
  paginatedList: IUser[];
  /** Danh sách đầy đủ sau khi lọc (để tính tổng số cho phân trang) */
  filteredCount: number;
  /** ID của tài khoản đang đăng nhập (để áp dụng AC-04) */
  currentUserId: number | null;
  /** Giá trị ô tìm kiếm (controlled từ StaffBoard) */
  searchInput: string;
  /** Giá trị dropdown lọc trạng thái */
  statusFilter: StatusFilter;
  /** Trang hiện tại */
  currentPage: number;
  /** Tổng số trang */
  totalPages: number;
  // ── Callbacks ──────────────────────────────────────────────────────────────
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string | null) => void;
  onPageChange: (page: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  onEdit: (staff: IUser) => void;
  onDelete: (staff: IUser) => void;
}

export function StaffTable({
  paginatedList,
  filteredCount,
  currentUserId,
  searchInput,
  statusFilter,
  currentPage,
  totalPages,
  onSearchChange,
  onStatusFilterChange,
  onPageChange,
  onToggleStatus,
  onEdit,
  onDelete,
}: StaffTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        {/* Ô tìm kiếm */}
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="input-search-staff"
            type="search"
            placeholder="Tìm theo họ tên, email..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 pl-9"
            aria-label="Tìm kiếm nhân viên theo họ tên hoặc email"
          />
        </div>

        {/* Dropdown lọc trạng thái */}
        {/*
          FIX: @base-ui/react Select hiển thị giá trị thô ('all', 'active'...) khi có value.
          Giải pháp: dùng map để render nhãn tiếng Việt tương ứng trong Trigger.
        */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger
            id="select-status-filter"
            className="h-9 w-full sm:w-48"
            aria-label="Lọc theo trạng thái"
          >
            <span className="flex flex-1 text-left text-sm">
              {{
                all: 'Tất cả trạng thái',
                active: 'Đang hoạt động',
                inactive: 'Vô hiệu hóa',
              }[statusFilter]}
            </span>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Staff Table ───────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" aria-label="Danh sách nhân viên">
          <thead>
            <tr className="bg-primary-light text-left">
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-foreground">
                Họ tên
              </th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-foreground">
                Email
              </th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-foreground">
                Vai trò
              </th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-foreground">
                Trạng thái
              </th>
              <th scope="col" className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedList.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  Không tìm thấy nhân viên nào phù hợp.
                </td>
              </tr>
            ) : (
              paginatedList.map((staff) => {
                // AC-04: Kiểm tra xem đây có phải tài khoản đang đăng nhập không
                const isSelf = currentUserId !== null && staff.id === currentUserId;
                // Tài khoản OWNER không được phép bị vô hiệu hóa / xóa
                const isOwner = staff.role === UserRole.OWNER;

                return (
                  <tr
                    key={staff.id}
                    className={[
                      'transition-colors hover:bg-muted/40',
                      !staff.isActive ? 'opacity-60' : '',
                    ].join(' ')}
                  >
                    {/* Họ tên + Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <StaffAvatar fullName={staff.fullName} />
                        <span
                          className={[
                            'font-medium text-foreground',
                            !staff.isActive ? 'line-through text-muted-foreground' : '',
                          ].join(' ')}
                        >
                          {staff.fullName}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td
                      className={[
                        'px-4 py-3',
                        !staff.isActive ? 'text-muted-foreground' : 'text-foreground',
                      ].join(' ')}
                    >
                      {staff.email}
                    </td>

                    {/* Badge vai trò */}
                    <td className="px-4 py-3">
                      <RoleBadge role={staff.role} />
                    </td>

                    {/* Switch trạng thái + nhãn */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusToggle
                          staffId={staff.id}
                          isActive={staff.isActive}
                          isOwner={isOwner}
                          isSelf={isSelf}
                          onToggle={onToggleStatus}
                        />
                        <span
                          className={[
                            'text-sm font-medium',
                            staff.isActive ? 'text-success' : 'text-muted-foreground',
                          ].join(' ')}
                        >
                          {staff.isActive ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                        </span>
                      </div>
                    </td>

                    {/* Nút thao tác: Sửa + Xóa */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        {/* Nút Sửa */}
                        <button
                          type="button"
                          aria-label={`Chỉnh sửa thông tin ${staff.fullName}`}
                          onClick={() => onEdit(staff)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                        >
                          <PencilIcon className="size-4" aria-hidden="true" />
                        </button>

                        {/* Nút Xóa — ẩn hoàn toàn với tài khoản Owner */}
                        {!isOwner && (
                          <button
                            type="button"
                            aria-label={`Xóa nhân viên ${staff.fullName}`}
                            onClick={() => onDelete(staff)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                          >
                            <Trash2Icon className="size-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Phân trang ────────────────────────────────────────────────────── */}
      <div className="border-t border-border px-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCount}
          pageSize={PAGE_SIZE}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
