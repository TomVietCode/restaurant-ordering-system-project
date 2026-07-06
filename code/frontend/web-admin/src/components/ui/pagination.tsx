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

const SIBLING_COUNT = 0;
const MAX_SLOTS = 4; 

/**
 * Tính dải số trang rút gọn, tối đa MAX_SLOTS nút, kiểu "1 … 5 … 50".
 * Luôn giữ trang đầu, trang cuối, trang hiện tại ± SIBLING_COUNT.
 * '…' là placeholder cho khoảng bị ẩn (không phải nút bấm).
 */
function getPageRange(page: number, totalPages: number): (number | '…')[] {
  // Ít trang thì hiện đủ luôn, không cần rút gọn.
  if (totalPages <= MAX_SLOTS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const left = Math.max(page - SIBLING_COUNT, 1);
  const right = Math.min(page + SIBLING_COUNT, totalPages);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < totalPages - 1;

  const pages: (number | '…')[] = [1];
  if (showLeftEllipsis) pages.push('…');
  for (let i = Math.max(left, 2); i <= Math.min(right, totalPages - 1); i++) pages.push(i);
  if (showRightEllipsis) pages.push('…');
  pages.push(totalPages);
  return pages;
}

/**
 * Phân trang dùng chung cho mọi bảng admin: dòng tóm tắt + dải nút số trang.
 * Tự ẩn khi không có dữ liệu. Tự rút gọn (…) khi có nhiều trang để không tràn ngang.
 */
export function Pagination({ page, pageSize, total, onPageChange, unit = 'mục' }: Props) {
  if (total === 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const range = getPageRange(page, totalPages);

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} trên {total} {unit}</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹</Button>
        {range.map((n, i) =>
          n === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 select-none">…</span>
          ) : (
            <Button key={n} size="icon-sm"
              variant={page === n ? 'default' : 'outline'}
              className={page === n ? 'bg-primary text-primary-foreground hover:bg-primary-dark' : ''}
              onClick={() => onPageChange(n)}>
              {n}
            </Button>
          ),
        )}
        <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>›</Button>
      </div>
    </div>
  );
}
