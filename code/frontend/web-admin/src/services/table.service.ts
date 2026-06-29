import { apiWithToken } from '@/lib/api';
import type { Table, TableStatus } from '@/types/table';

interface ApiRes<T> { data: T }

export const tableService = {
  async getAll(token?: string | null): Promise<Table[]> {
    const res = await apiWithToken(token).get<ApiRes<Table[]>>('/tables');
    return res.data;
  },

  async create(token: string | null | undefined, dto: { name: string; capacity: number; status?: TableStatus }): Promise<Table> {
    const res = await apiWithToken(token).post<ApiRes<Table>>('/tables', dto);
    return res.data;
  },

  async update(token: string | null | undefined, id: string, dto: { name?: string; capacity?: number; status?: TableStatus }): Promise<Table> {
    const res = await apiWithToken(token).patch<ApiRes<Table>>(`/tables/${id}`, dto);
    return res.data;
  },

  async toggleStatus(token: string | null | undefined, id: string): Promise<Table> {
    const res = await apiWithToken(token).patch<ApiRes<Table>>(`/tables/${id}/toggle-status`);
    return res.data;
  },

  async remove(token: string | null | undefined, id: string): Promise<void> {
    await apiWithToken(token).delete(`/tables/${id}`);
  },
};
