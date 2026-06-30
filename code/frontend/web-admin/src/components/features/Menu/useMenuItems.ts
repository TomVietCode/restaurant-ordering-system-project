import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { categoryService, itemService } from '@/services/menu.service';
import { useRealtime } from '@/hooks/use-realtime';
import { selectPage } from '@/lib/paginate';
import { toViError } from '@/lib/errors';
import type { Category, Item } from '@/types/menu';

export const PAGE = 10;

type Status = 'ALL' | 'REMAIN' | 'OUT';
type PriceSort = '' | 'ASC' | 'DESC';

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

  // Toàn bộ item tải về 1 lần; mọi thao tác lọc/sắp xếp/phân trang đều client-side trên list này
  const [master, setMaster]   = useState<Item[]>([]);
  const [cats, setCats]       = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc — khởi tạo từ URL để chia sẻ/đổi tab giữ nguyên trạng thái
  const [cur, setCur]       = useState(() => Number(sp.get('p') || 1));
  const [search, setSearch] = useState(() => sp.get('q') ?? '');
  const [catId, setCatId]   = useState<number | undefined>(() => { const v = sp.get('cat'); return v ? Number(v) : undefined; });
  const [status, setStatus] = useState<Status>(() => { const v = sp.get('s'); return (v === 'REMAIN' || v === 'OUT') ? v : 'ALL'; });
  const [price, setPrice]   = useState<PriceSort>(() => { const v = sp.get('sort'); return (v === 'ASC' || v === 'DESC') ? v : ''; });

  // Dialog / trạng thái thao tác
  const [sheet, setSheet]               = useState(false);
  const [editing, setEditing]           = useState<Item | null>(null);
  const [delTarget, setDel]             = useState<Item | null>(null);
  const [delLoading, setDL]             = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Item | null>(null);
  const [toggleLoading, setTL]          = useState(false);
  const [detailTarget, setDetailTarget] = useState<Item | null>(null);

  useEffect(() => {
    if (!token) return;
    let ok = true;
    void (async () => {
      setLoading(true);
      try {
        const [items, categories] = await Promise.all([
          itemService.getAllItems(token),
          categoryService.getAll(token),
        ]);
        if (!ok) return;
        setMaster(items);
        setCats(categories);
      } catch {
        if (ok) toast.error('Không thể tải danh sách món');
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [token]);

  // Realtime: khi 1 món được bật/tắt còn hàng (kể cả từ tab/thiết bị khác hoặc do BE) → cập nhật ngay
  useRealtime<{ itemId: number; isRemain: boolean }>('menu:item-availability-changed', ({ itemId, isRemain }) => {
    setMaster(prev => prev.map(i => i.id === itemId ? { ...i, isRemain } : i));
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

  // Lọc + sắp xếp client-side (mặc định mới nhất trước, khớp default createdAt DESC của BE)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = master;
    if (q)              list = list.filter(i => i.name.toLowerCase().includes(q));
    if (catId)          list = list.filter(i => i.categoryId === catId);
    if (status !== 'ALL') list = list.filter(i => status === 'REMAIN' ? i.isRemain : !i.isRemain);
    return list.slice().sort((a, b) =>
      price
        ? (price === 'ASC' ? a.price - b.price : b.price - a.price)
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [master, search, catId, status, price]);

  const { total, totalPages, page, rows: visible } = selectPage(filtered, cur, PAGE);

  const onSearch     = (v: string) => { setSearch(v); setCur(1); pushUrl({ q: v, p: undefined }); };
  const onCatChange  = (v: number | undefined) => { setCatId(v); setCur(1); pushUrl({ cat: v, p: undefined }); };
  const onPriceChange = (v: PriceSort) => { setPrice(v); setCur(1); pushUrl({ sort: v, p: undefined }); };
  const onStatusChange = (v: Status) => { setStatus(v); setCur(1); pushUrl({ s: v, p: undefined }); };
  const onPageChange = (n: number) => { setCur(n); pushUrl({ p: n }); };

  // POST/PATCH /items chỉ trả categoryId, KHÔNG kèm object `category` → cột "Danh mục" sẽ hiện "—".
  // Gắn lại category từ danh sách `cats` đã có để hiển thị đúng ngay, không cần tải lại toàn bộ.
  function withCategory(it: Item): Item {
    const cat = cats.find(c => c.id === it.categoryId);
    return cat ? { ...it, category: cat } : it;
  }

  async function onSave(f: SaveForm, id?: number) {
    const dto = {
      name: f.name, price: f.price, categoryId: f.categoryId,
      description: f.description || undefined,
      imagesUrl: f.imagesUrl ?? undefined,
      isRemain: f.isRemain,
    };
    try {
      if (id) {
        const updated = withCategory(await itemService.update(id, dto, token));
        setMaster(prev => prev.map(i => i.id === id ? updated : i));
        toast.success('Đã cập nhật');
      } else {
        const created = withCategory(await itemService.create(dto, token));
        setMaster(prev => [created, ...prev]);
        toast.success('Thêm thành công');
        // Bỏ lọc danh mục/trạng thái + về trang 1 để món mới chắc chắn hiển thị
        setCatId(undefined); setStatus('ALL'); setCur(1);
        pushUrl({ cat: undefined, s: undefined, p: undefined });
      }
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
      // Cập nhật local ngay; realtime sẽ phát cùng giá trị nên idempotent
      setMaster(prev => prev.map(i => i.id === item.id ? { ...i, isRemain: updated.isRemain } : i));
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
      setMaster(prev => prev.filter(i => i.id !== delTarget.id));
      toast.success('Đã xóa');
      setDel(null);
    } catch (ex) {
      toast.error(toViError(ex, 'Không thể xóa món. Vui lòng thử lại.'));
    } finally {
      setDL(false);
    }
  }

  return {
    cats, loading, visible,
    cur: page, search, catId, status, price,
    data: { total, totalPages },
    sheet, setSheet, editing, setEditing, delTarget, setDel, delLoading,
    toggleTarget, setToggleTarget, toggleLoading,
    detailTarget, setDetailTarget,
    onSearch, onCatChange, onPriceChange, onStatusChange, onPageChange,
    onSave, onToggleClick, confirmToggle, onDelete,
  };
}
