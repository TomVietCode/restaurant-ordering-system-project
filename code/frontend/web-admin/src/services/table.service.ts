import { apiWithToken } from '@/lib/api';
import type { Table } from '@/types/table';

// ─── đổi thành false khi backend sẵn sàng ───
const MOCK_MODE = true;

const MOCK_TABLES: Table[] = [
  { id: 'uuid-01', name: 'Bàn 01',  capacity: 2,    isAvailable: true  },
  { id: 'uuid-02', name: 'Bàn 02',  capacity: 4,    isAvailable: false },
  { id: 'uuid-03', name: 'Bàn 03',  capacity: 4,    isAvailable: true  },
  { id: 'uuid-04', name: 'Bàn 04',  capacity: 6,    isAvailable: true  },
  { id: 'uuid-05', name: 'Bàn 05', capacity: 8,    isAvailable: false },
  { id: 'uuid-06', name: 'Bàn 06', capacity: null, isAvailable: true  },
  { id: 'uuid-12', name: 'Bàn 12', capacity: 4,    isAvailable: false },
];

interface ApiRes<T> { data: T }

export const tableService = {
  async getAll(token?: string | null): Promise<Table[]> {
    if (MOCK_MODE) return MOCK_TABLES;
    const res = await apiWithToken(token).get<ApiRes<Table[]>>('/tables');
    return res.data;
  },

  async create(token: string | null | undefined, dto: { name: string; capacity?: number }): Promise<Table> {
    if (MOCK_MODE) return { id: crypto.randomUUID(), isAvailable: true, capacity: dto.capacity ?? null, name: dto.name };
    const res = await apiWithToken(token).post<ApiRes<Table>>('/tables', dto);
    return res.data;
  },

  async update(token: string | null | undefined, id: string, dto: Partial<{ name: string; capacity: number; isAvailable: boolean }>): Promise<Table> {
    if (MOCK_MODE) {
      const t = MOCK_TABLES.find(t => t.id === id)!;
      return { ...t, ...dto };
    }
    const res = await apiWithToken(token).patch<ApiRes<Table>>(`/tables/${id}`, dto);
    return res.data;
  },

  async remove(token: string | null | undefined, id: string): Promise<void> {
    if (MOCK_MODE) return;
    await apiWithToken(token).delete(`/tables/${id}`);
  },
};
