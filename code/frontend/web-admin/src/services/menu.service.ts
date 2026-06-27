import { apiClient } from '@/lib/api';
import type { Category, Item, ItemsPage, CreateCategoryDto, CreateItemDto, UpdateItemDto } from '@/types/menu';

// đổi thành false khi backend sẵn sàng
const MOCK_MODE = true;

// ── Mock data ──────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Cà phê',      itemCount: 1, createdAt: now, updatedAt: now },
  { id: 2, name: 'Trà',         itemCount: 1, createdAt: now, updatedAt: now },
  { id: 3, name: 'Đồ ăn',       itemCount: 1, createdAt: now, updatedAt: now },
  { id: 4, name: 'Tráng miệng', itemCount: 1, createdAt: now, updatedAt: now },
];

const MOCK_ITEMS: Item[] = [
  { id: 1, name: 'Cà phê đen',     price: 25000, imagesUrl: ['/images/yangyang.jpg'], description: 'Cà phê đậm đà', isRemain: true,  categoryId: 1, category: MOCK_CATEGORIES[0], createdAt: now, updatedAt: now, deletedAt: null },
  { id: 2, name: 'Trà đào cam sả',  price: 35000, imagesUrl: ['/images/yangyang.jpg'], description: null,            isRemain: true,  categoryId: 2, category: MOCK_CATEGORIES[1], createdAt: now, updatedAt: now, deletedAt: null },
  { id: 3, name: 'Cơm sườn dưa bò', price: 32000, imagesUrl: ['/images/yangyang.jpg'], description: null,            isRemain: true,  categoryId: 3, category: MOCK_CATEGORIES[2], createdAt: now, updatedAt: now, deletedAt: null },
  { id: 4, name: 'Bánh croissant',  price: 25000, imagesUrl: ['/images/yangyang.jpg'], description: null,            isRemain: true,  categoryId: 4, category: MOCK_CATEGORIES[3], createdAt: now, updatedAt: now, deletedAt: null },
];

let mockCategories = [...MOCK_CATEGORIES];
let mockItems      = [...MOCK_ITEMS];
let nextCatId  = 5;
let nextItemId = 10;

interface ApiRes<T> { data: T }

// ── Category Service ───────────────────────────────────────────────────────────

export const categoryService = {
  async getAll(): Promise<Category[]> {
    if (MOCK_MODE) {
      return mockCategories.map(c => ({
        ...c,
        itemCount: mockItems.filter(i => i.categoryId === c.id).length,
      }));
    }
    const res = await apiClient.get<ApiRes<Category[]>>('/categories');
    return res.data;
  },

  async create(dto: CreateCategoryDto): Promise<Category> {
    if (MOCK_MODE) {
      if (mockCategories.some(c => c.name.toLowerCase() === dto.name.toLowerCase())) {
        throw new Error('Tên danh mục đã tồn tại');
      }
      const cat: Category = { id: nextCatId++, name: dto.name, itemCount: 0, createdAt: now, updatedAt: now };
      mockCategories = [...mockCategories, cat];
      return cat;
    }
    const res = await apiClient.post<ApiRes<Category>>('/categories', dto);
    return res.data;
  },

  async update(id: number, dto: Partial<CreateCategoryDto>): Promise<Category> {
    if (MOCK_MODE) {
      if (dto.name && mockCategories.some(c => c.id !== id && c.name.toLowerCase() === dto.name!.toLowerCase())) {
        throw new Error('Tên danh mục đã tồn tại');
      }
      mockCategories = mockCategories.map(c => c.id === id ? { ...c, ...dto } : c);
      return mockCategories.find(c => c.id === id)!;
    }
    const res = await apiClient.patch<ApiRes<Category>>(`/categories/${id}`, dto);
    return res.data;
  },

  async remove(id: number): Promise<void> {
    if (MOCK_MODE) {
      const count = mockItems.filter(i => i.categoryId === id).length;
      if (count > 0) throw new Error(`Danh mục này còn ${count} món ăn. Vui lòng chuyển hoặc xóa các món trước.`);
      mockCategories = mockCategories.filter(c => c.id !== id);
      return;
    }
    await apiClient.delete(`/categories/${id}`);
  },
};

// ── Item Service ───────────────────────────────────────────────────────────────

export interface ItemsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}

export const itemService = {
  async getAll(query: ItemsQuery = {}): Promise<ItemsPage> {
    if (MOCK_MODE) {
      const { page = 1, limit = 10, search, categoryId } = query;
      let filtered = mockItems;
      if (search)     filtered = filtered.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
      if (categoryId) filtered = filtered.filter(i => i.categoryId === categoryId);
      const total = filtered.length;
      const items = filtered.slice((page - 1) * limit, page * limit).map(i => ({
        ...i,
        category: mockCategories.find(c => c.id === i.categoryId) ?? i.category,
      }));
      return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
    }
    const params = new URLSearchParams();
    if (query.page)       params.set('page',       String(query.page));
    if (query.limit)      params.set('limit',      String(query.limit));
    if (query.search)     params.set('search',     query.search);
    if (query.categoryId) params.set('categoryId', String(query.categoryId));
    const res = await apiClient.get<ApiRes<ItemsPage>>(`/items?${params}`);
    return res.data;
  },

  async create(dto: CreateItemDto): Promise<Item> {
    if (MOCK_MODE) {
      const cat = mockCategories.find(c => c.id === dto.categoryId);
      if (!cat) throw new Error('Danh mục không tồn tại');
      const item: Item = {
        id: nextItemId++,
        name: dto.name,
        price: dto.price,
        imagesUrl: dto.imagesUrl ?? null,
        description: dto.description ?? null,
        isRemain: dto.isRemain ?? true,
        categoryId: dto.categoryId,
        category: cat,
        createdAt: now, updatedAt: now, deletedAt: null,
      };
      mockItems = [...mockItems, item];
      return item;
    }
    const res = await apiClient.post<ApiRes<Item>>('/items', dto);
    return res.data;
  },

  async update(id: number, dto: UpdateItemDto): Promise<Item> {
    if (MOCK_MODE) {
      if (dto.categoryId) {
        const cat = mockCategories.find(c => c.id === dto.categoryId);
        if (!cat) throw new Error('Danh mục không tồn tại');
      }
      mockItems = mockItems.map(i => {
        if (i.id !== id) return i;
        const merged = { ...i, ...dto };
        const cat = mockCategories.find(c => c.id === merged.categoryId) ?? i.category;
        return { ...merged, category: cat };
      });
      return mockItems.find(i => i.id === id)!;
    }
    const res = await apiClient.patch<ApiRes<Item>>(`/items/${id}`, dto);
    return res.data;
  },

  async toggleAvailability(id: number, isRemain: boolean): Promise<Item> {
    if (MOCK_MODE) {
      mockItems = mockItems.map(i => i.id === id ? { ...i, isRemain } : i);
      return mockItems.find(i => i.id === id)!;
    }
    const res = await apiClient.patch<ApiRes<Item>>(`/items/${id}/availability`, { isRemain });
    return res.data;
  },

  async remove(id: number): Promise<void> {
    if (MOCK_MODE) {
      mockItems = mockItems.filter(i => i.id !== id);
      return;
    }
    await apiClient.delete(`/items/${id}`);
  },
};
