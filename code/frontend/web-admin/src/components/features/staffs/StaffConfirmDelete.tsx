'use client';

// ─────────────────────────────────────────────────────────────────────────────
// StaffConfirmDelete.tsx — Dialog xác nhận xóa nhân viên
// Thiết kế theo ảnh tham khảo:
//   - Tiêu đề góc trái + nút × góc phải
//   - Tên nhân viên in đậm trong câu xác nhận
//   - Nút Hủy: viền xám, nền trắng; Nút Xóa: nền đỏ nhạt, chữ đỏ đậm
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { type IUser } from './types';

interface StaffConfirmDeleteProps {
  /** Nhân viên đang chờ xác nhận xóa. null = dialog đóng. */
  staff: IUser | null;
  /** Callback đóng dialog mà không xóa */
  onCancel: () => void;
  /** Callback xác nhận xóa — logic xóa thực tế nằm ở StaffBoard */
  onConfirm: () => void;
}

export function StaffConfirmDelete({ staff, onCancel, onConfirm }: StaffConfirmDeleteProps) {
  return (
    <Dialog
      open={!!staff}
      onOpenChange={(isOpen) => !isOpen && onCancel()}
    >
      <DialogContent
        className="sm:max-w-sm"
        showCloseButton
        aria-describedby="delete-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">
            Xóa nhân viên
          </DialogTitle>
        </DialogHeader>

        <p
          id="delete-dialog-description"
          className="text-sm text-foreground"
        >
          Bạn có chắc chắn muốn xóa{' '}
          <strong className="font-semibold">{staff?.fullName}</strong>?{' '}
          Hành động này không thể hoàn tác.
        </p>

        {/*
          DialogFooter ưu tiên sm:justify-end để các nút căn phải trên desktop,
          xếp dọc (flex-col-reverse) trên mobile.
        */}
        <DialogFooter>
          {/* Nút Hủy: viền xám, nền trắng */}
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Hủy
          </Button>

          {/* Nút Xóa: nền đỏ nhạt, chữ đỏ đậm — theo ảnh tham khảo */}
          <Button
            type="button"
            id="btn-confirm-delete"
            onClick={onConfirm}
            className="bg-danger/10 text-danger hover:bg-danger/20"
          >
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
