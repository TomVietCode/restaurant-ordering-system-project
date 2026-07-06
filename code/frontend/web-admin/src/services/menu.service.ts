import { apiWithToken } from '@/lib/api';
import type { Category, Item, ItemsPage, CreateCategoryDto, CreateItemDto, UpdateItemDto } from '@/types/menu';

interface ApiRes<T> { data: T }

export interface ItemsQuery {
  page?: number; limit?: number; search?: string; categoryId?: number;
  sortBy?: 'price' | 'name' | 'createdAt'; sortOrder?: 'ASC' | 'DESC';
}
function normalizeItem(raw: Item): Item {
  return { ...raw, price: Number(raw.price) };
}

export const categoryService = {
  async getAll(token?: string | null): Promise<Category[]> {
    const res = await apiWithToken(token).get<ApiRes<Category[]>>('/categories');
    return res.data;
  },
  async create(dto: CreateCategoryDto, token?: string | null): Promise<Category> {
    const res = await apiWithToken(token).post<ApiRes<Category>>('/categories', dto);
    return res.data;
  },
  async update(id: number, dto: Partial<CreateCategoryDto>, token?: string | null): Promise<Category> {
    const res = await apiWithToken(token).patch<ApiRes<Category>>(`/categories/${id}`, dto);
    return res.data;
  },
  async remove(id: number, token?: string | null): Promise<void> {
    await apiWithToken(token).delete(`/categories/${id}`);
  },
};

export const itemService = {
  // Một trang item (server-side pagination) — dùng cho kiểm tra trùng tên trong ItemDialog.
  async getAll(q: ItemsQuery = {}, token?: string | null): Promise<ItemsPage> {
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => { if (v !== undefined && v !== '') p.set(k, String(v)); });
    const res = await apiWithToken(token).get<ApiRes<ItemsPage>>(`/items?${p}`);
    return { ...res.data, items: res.data.items.map(normalizeItem) };
  },

  // Toàn bộ item (duyệt hết các trang, 100 item/trang — giới hạn limit của BE).
  // Trang /menu lọc + sắp xếp + phân trang hoàn toàn client-side trên danh sách này,
  // vì BE không hỗ trợ lọc theo trạng thái còn/hết hàng (isRemain).
  async getAllItems(token?: string | null): Promise<Item[]> {
    const all: Item[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await apiWithToken(token).get<ApiRes<ItemsPage>>(`/items?limit=100&page=${page}`);
      all.push(...res.data.items.map(normalizeItem));
      totalPages = res.data.totalPages;
      page++;
    } while (page <= totalPages);
    return all;
  },

  async create(dto: CreateItemDto, token?: string | null): Promise<Item> {
    const res = await apiWithToken(token).post<ApiRes<Item>>('/items', dto);
    return normalizeItem(res.data);
  },
  async update(id: number, dto: UpdateItemDto, token?: string | null): Promise<Item> {
    const res = await apiWithToken(token).patch<ApiRes<Item>>(`/items/${id}`, dto);
    return normalizeItem(res.data);
  },
  async toggleAvailability(id: number, isRemain: boolean, token?: string | null): Promise<Item> {
    const res = await apiWithToken(token).patch<ApiRes<Item>>(`/items/${id}/availability`, { isRemain });
    return normalizeItem(res.data);
  },
  async remove(id: number, token?: string | null): Promise<void> {
    await apiWithToken(token).delete(`/items/${id}`);
  },
};
