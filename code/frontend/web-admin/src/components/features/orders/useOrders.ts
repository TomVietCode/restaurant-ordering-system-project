import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { orderService } from '@/services/order.service';
import { toViError } from '@/lib/errors';
import type { Order, OrderStatus } from '@/types/order';

export const ORDERS_PAGE = 10;

type StatusFilter = 'ALL' | OrderStatus;
type DateFilter = 'all' | 'today' | 'week' | 'month';

const STATUSES: OrderStatus[] = ['NEW', 'PREPARING', 'SERVED', 'PAID', 'CANCEL'];

/** Parse trang từ URL an toàn — chặn NaN/số âm/số 0 nếu user tự sửa query string. */
function parsePage(v: string | null): number {
  const n = Number(v);
  return v && Number.isInteger(n) && n > 0 ? n : 1;
}

export function useOrders() {
  const { data: session, status: sessionStatus } = useSession();
  const token    = session?.accessToken ?? null;
  const router   = useRouter();
  const pathname = usePathname();
  const sp       = useSearchParams();

  const [rows, setRows]             = useState<Order[]>([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);

  const [cur, setCur]       = useState(() => parsePage(sp.get('p')));
  // Search KHÔNG đồng bộ vào URL — reload trang là ô tìm kiếm trống lại (yêu cầu user).
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>(() => {
    const v = sp.get('s');
    return v && STATUSES.includes(v as OrderStatus) ? (v as OrderStatus) : 'ALL';
  });
  const [dateFilter, setDateFilter] = useState<DateFilter>(() => {
    const v = sp.get('d');
    return v === 'today' || v === 'week' || v === 'month' ? v : 'all';
  });

  const [detailTarget, setDetailTarget]   = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Phiên hết hạn/không có token sau khi NextAuth đã resolve xong (không phải đang loading)
  // → dừng loading, hiện trạng thái riêng thay vì treo spinner mãi.
  const sessionResolved = sessionStatus !== 'loading';
  const unauthenticated = sessionResolved && !token;

  function pushUrl(params: Record<string, string | number | undefined>) {
    const p = new URLSearchParams(sp.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (!v || v === 'ALL' || v === 'all' || v === 1) p.delete(k);
      else p.set(k, String(v));
    });
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }

  const fetchPage = useCallback(async (page: number, q: string, s: StatusFilter, d: DateFilter) => {
    if (!token) return;
    setLoading(true);
    try {
      // Bỏ dấu "#" nếu user dán mã đơn từ bảng (hiển thị dạng "#ODXXXX") — BE tìm ILIKE trên trackingCode thuần.
      const res = await orderService.getOrdersPage({
        page,
        limit: ORDERS_PAGE,
        search: q.trim().replace(/^#/, '') || undefined,
        status: s === 'ALL' ? undefined : s,
        dateFilter: d === 'all' ? undefined : d,
      }, token);
      setRows(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (ex) {
      toast.error(toViError(ex, 'Không thể tải danh sách đơn hàng.'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Debounce search 300ms — status/date/page đổi thì fetch ngay (đồng bộ pattern /list, /menu)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!token) {
      // Phiên đã resolve xong nhưng không có token → không phải đang chờ, dừng spinner.
      if (sessionResolved) setLoading(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { void fetchPage(cur, search, status, dateFilter); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [token, sessionResolved, cur, search, status, dateFilter, fetchPage]);

  const onSearch       = (v: string) => { setSearch(v); setCur(1); pushUrl({ p: undefined }); };
  const onStatusChange = (v: StatusFilter) => { setStatus(v); setCur(1); pushUrl({ s: v, p: undefined }); };
  const onDateChange   = (v: DateFilter) => { setDateFilter(v); setCur(1); pushUrl({ d: v, p: undefined }); };
  const onPageChange   = (n: number) => { setCur(parsePage(String(n))); pushUrl({ p: n }); };

  // Mở dialog ngay với data đã có trong bảng, rồi tải chi tiết mới nhất từ /orders/:id.
  // Nếu đơn không còn tồn tại (404) hoặc lỗi khác → đóng dialog thay vì để lại data cũ trên màn hình.
  async function onView(order: Order) {
    setDetailTarget(order);
    setDetailLoading(true);
    try {
      const full = await orderService.getOrderById(token, order.id);
      setDetailTarget(full);
    } catch (ex) {
      toast.error(toViError(ex, 'Không thể tải chi tiết đơn hàng.'));
      setDetailTarget(null);
    } finally {
      setDetailLoading(false);
    }
  }

  return {
    rows, loading, total, totalPages, cur,
    search, status, dateFilter, unauthenticated,
    onSearch, onStatusChange, onDateChange, onPageChange,
    detailTarget, detailLoading, onView, setDetailTarget,
  };
}
