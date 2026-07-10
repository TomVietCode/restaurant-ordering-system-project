import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { categoryService, itemService } from '@/services/menu.service';
import { useRealtime } from '@/hooks/use-realtime';
import { toViError } from '@/lib/errors';
import type { Category, Item } from '@/types/menu';

export const PAGE_SIZES = [5, 10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

type Status = 'ALL' | 'REMAIN' | 'OUT';
export type SortBy = 'createdAt' | 'price' | 'name';
export type SortOrder = 'ASC' | 'DESC';

interface SaveForm {
  name: string; price: number; categoryId: number;
  description: string; imagesUrl: string[] | null; isRemain: boolean;
}

export function useMenuItems() {
  const { data: session } = useSession();
  const token    = session?.accessToken ?? null;
  const router   = useRouter();
  const pathname = usePathname();
  const sp       = useSearchParams();

  // Trang hiện tại (đã lọc/sắp xếp/phân trang ở BACKEND) + tổng số liệu server trả về
  const [items, setItems]           = useState<Item[]>([]);
  const [cats, setCats]             = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reloadKey, setReloadKey]   = useState(0);

  // Bộ lọc — khởi tạo từ URL để chia sẻ/đổi tab giữ nguyên trạng thái
  const [cur, setCur]           = useState(() => Number(sp.get('p') || 1));
  const [pageSize, setPageSize] = useState(() => {
    const v = Number(sp.get('ps'));
    return (PAGE_SIZES as readonly number[]).includes(v) ? v : DEFAULT_PAGE_SIZE;
  });
  const [search, setSearch]                   = useState(''); // không khôi phục từ URL — reload trang là ô tìm kiếm trống
  const [searchDebounced, setSearchDebounced] = useState('');
  const [catId, setCatId]   = useState<number | undefined>(() => { const v = sp.get('cat'); return v ? Number(v) : undefined; });
  const [status, setStatus] = useState<Status>(() => { const v = sp.get('s'); return (v === 'REMAIN' || v === 'OUT') ? v : 'ALL'; });
  const [sortBy, setSortBy]       = useState<SortBy>(() => { const v = sp.get('sort'); return (v === 'price' || v === 'name' || v === 'createdAt') ? v : 'createdAt'; });
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => (sp.get('dir') === 'ASC' ? 'ASC' : 'DESC'));

  // Dialog / trạng thái thao tác
  const [sheet, setSheet]               = useState(false);
  const [editing, setEditing]           = useState<Item | null>(null);
  const [delTarget, setDel]             = useState<Item | null>(null);
  const [delLoading, setDL]             = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Item | null>(null);
  const [toggleLoading, setTL]          = useState(false);
  const [detailTarget, setDetailTarget] = useState<Item | null>(null);

  // Debounce ô tìm kiếm 300ms trước khi gửi request lên backend
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Danh mục — tải 1 lần để đổ vào bộ lọc + dialog thêm/sửa
  useEffect(() => {
    if (!token) return;
    let ok = true;
    categoryService.getAll(token).then(c => { if (ok) setCats(c); }).catch(() => {});
    return () => { ok = false; };
  }, [token]);

  // Tải trang món ăn hiện tại: tìm kiếm/lọc danh mục/trạng thái/sắp xếp/phân trang đều xử lý ở BACKEND.
  // ⚠️ isRemain: BE (QueryItemsDto) chưa whitelist field này nên khi lọc Còn/Hết hàng sẽ bị 400 —
  // toast lỗi tiếng Việt sẽ hiện cho tới khi BE bổ sung hỗ trợ.
  useEffect(() => {
    if (!token) return;
    let ok = true;
    void (async () => {
      setLoading(true);
      try {
        const res = await itemService.getAll({
          page: cur, limit: pageSize,
          search: searchDebounced || undefined,
          categoryId: catId,
          isRemain: status === 'ALL' ? undefined : status === 'REMAIN',
          sortBy, sortOrder,
        }, token);
        if (!ok) return;
        // Nếu filter làm giảm số trang khiến trang hiện tại vượt quá → nhảy về trang cuối hợp lệ
        if (res.totalPages > 0 && cur > res.totalPages) {
          setCur(res.totalPages);
        } else {
          setItems(res.items);
        }
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (ex) {
        if (ok) toast.error(toViError(ex, 'Không thể tải danh sách món'));
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [token, cur, pageSize, searchDebounced, catId, status, sortBy, sortOrder, reloadKey]);

  // Realtime: khi 1 món được bật/tắt còn hàng (kể cả từ tab/thiết bị khác hoặc do BE) → cập nhật ngay
  useRealtime<{ itemId: number; isRemain: boolean }>('menu:item-availability-changed', ({ itemId, isRemain }) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, isRemain } : i));
  });

  // Cập nhật URL khi filter đổi. Hàm thường (không memo) nên luôn đọc `sp` mới nhất của render hiện tại.
  function pushUrl(params: Record<string, string | number | undefined>) {
    const p = new URLSearchParams(sp.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (!v || v === 'ALL' || v === 1) p.delete(k);
      else p.set(k, String(v));
    });
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }

  const reload = () => setReloadKey(k => k + 1);

  const onSearch         = (v: string) => { setSearch(v); setCur(1); };
  const onCatChange      = (v: number | undefined) => { setCatId(v); setCur(1); pushUrl({ cat: v, p: undefined }); };
  const onSortChange     = (by: SortBy, order: SortOrder) => {
    setSortBy(by); setSortOrder(order); setCur(1);
    // Mặc định (createdAt / DESC) → bỏ khỏi URL cho gọn.
    pushUrl({ sort: by === 'createdAt' ? undefined : by, dir: order === 'DESC' ? undefined : order, p: undefined });
  };
  const onStatusChange   = (v: Status) => { setStatus(v); setCur(1); pushUrl({ s: v, p: undefined }); };
  const onPageChange     = (n: number) => { setCur(n); pushUrl({ p: n }); };
  const onPageSizeChange = (n: number) => { setPageSize(n); setCur(1); pushUrl({ ps: n === DEFAULT_PAGE_SIZE ? undefined : n, p: undefined }); };

  async function onSave(f: SaveForm, id?: number) {
    const dto = {
      name: f.name, price: f.price, categoryId: f.categoryId,
      description: f.description || undefined,
      imagesUrl: f.imagesUrl ?? undefined,
      isRemain: f.isRemain,
    };
    try {
      if (id) {
        await itemService.update(id, dto, token);
        toast.success('Đã cập nhật');
      } else {
        await itemService.create(dto, token);
        toast.success('Thêm thành công');
        // Bỏ lọc danh mục/trạng thái + về trang 1 để món mới chắc chắn hiển thị
        setCatId(undefined); setStatus('ALL'); setCur(1);
        pushUrl({ cat: undefined, s: undefined, p: undefined });
      }
      reload(); // tải lại trang hiện tại từ server để dữ liệu (kể cả category join) luôn chính xác
    } catch (ex) {
      console.error('Save item error:', ex);
      toast.error(toViError(ex, id ? 'Không thể sửa thông tin món. Vui lòng thử lại.' : 'Không thể tạo món mới. Vui lòng thử lại.'));
      throw ex; // re-throw để ItemDialog giữ dialog mở cho user thử lại
    }
  }

  // Click toggle chỉ mở dialog xác nhận, chưa gọi API
  const onToggleClick = (item: Item) => setToggleTarget(item);

  async function confirmToggle() {
    if (!toggleTarget) return;
    const item = toggleTarget;
    setTL(true);
    try {
      const updated = await itemService.toggleAvailability(item.id, !item.isRemain, token);
      // Cập nhật ngay trên trang hiện tại; realtime sẽ phát cùng giá trị nên idempotent
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isRemain: updated.isRemain } : i));
      setToggleTarget(null);
    } catch (ex) {
      toast.error(toViError(ex, 'Không thể thay đổi trạng thái món. Vui lòng thử lại.'));
    } finally {
      setTL(false);
    }
  }

  async function onDelete() {
    if (!delTarget) return;
    setDL(true);
    try {
      await itemService.remove(delTarget.id, token);
      toast.success('Đã xóa');
      setDel(null);
      reload(); // tải lại để tổng số/số trang luôn đúng sau khi xóa
    } catch (ex) {
      toast.error(toViError(ex, 'Không thể xóa món. Vui lòng thử lại.'));
    } finally {
      setDL(false);
    }
  }

  return {
    cats, loading, visible: items,
    cur, pageSize, search, catId, status, sortBy, sortOrder,
    data: { total, totalPages },
    sheet, setSheet, editing, setEditing, delTarget, setDel, delLoading,
    toggleTarget, setToggleTarget, toggleLoading,
    detailTarget, setDetailTarget,
    onSearch, onCatChange, onSortChange, onStatusChange, onPageChange, onPageSizeChange,
    onSave, onToggleClick, confirmToggle, onDelete,
  };
}
