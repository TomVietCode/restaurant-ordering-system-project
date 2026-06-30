'use client';

import { Button } from '@/components/ui/button';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (n: number) => void;
  /** Đơn vị hiển thị trong dòng tóm tắt, vd "món", "danh mục", "bàn". */
  unit?: string;
}

/**
 * Phân trang dùng chung cho mọi bảng admin: dòng tóm tắt + dải nút số trang.
 * Tự ẩn khi không có dữ liệu.
 */
export function Pagination({ page, pageSize, total, onPageChange, unit = 'mục' }: Props) {
  if (total === 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} trên {total} {unit}</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹</Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button key={i} size="icon-sm"
            variant={page === i + 1 ? 'default' : 'outline'}
            className={page === i + 1 ? 'bg-primary text-primary-foreground hover:bg-primary-dark' : ''}
            onClick={() => onPageChange(i + 1)}>
            {i + 1}
          </Button>
        ))}
        <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>›</Button>
      </div>
    </div>
  );
}
