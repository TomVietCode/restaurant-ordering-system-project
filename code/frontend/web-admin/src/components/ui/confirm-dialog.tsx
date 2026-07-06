'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  /** 'destructive' cho hành động xóa; 'default' (màu primary) cho xác nhận thường. */
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
}

/**
 * Hộp thoại xác nhận dùng chung (xóa / đổi trạng thái / ...). Dùng cho mọi trang admin.
 */
export function ConfirmDialog({
  open, onOpenChange, title, description,
  confirmText = 'Xác nhận', cancelText = 'Hủy',
  loading = false, variant = 'default', onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>{cancelText}</Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            className={variant === 'default' ? 'bg-primary text-primary-foreground hover:bg-primary-dark' : ''}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Đang xử lý…' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
