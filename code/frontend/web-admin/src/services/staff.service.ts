import { apiWithToken } from '@/lib/api';
import type { Role } from '@/types/auth';
import type { Staff, CreateStaffDto, UpdateStaffDto } from '@/types/staff';

interface PaginatedRes {
  success: boolean;
  data: { items: Staff[]; page: number; limit: number; total: number; totalPages: number };
}
interface ApiRes<T> { success: boolean; data: T }

export interface StaffQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'email' | 'fullName';
  sortOrder?: 'ASC' | 'DESC';
}

export interface StaffPageResult {
  items: Staff[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const staffService = {
  async getPage(q: StaffQuery, token?: string | null): Promise<StaffPageResult> {
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => { if (v !== undefined && v !== '') p.set(k, String(v)); });
    const res = await apiWithToken(token).get<PaginatedRes>(`/users?${p}`);
    return res.data;
  },

  async create(dto: CreateStaffDto, token?: string | null): Promise<Staff> {
    const res = await apiWithToken(token).post<ApiRes<Staff>>('/users', dto);
    return res.data;
  },

  async update(id: number, dto: UpdateStaffDto, token?: string | null): Promise<Staff> {
    const res = await apiWithToken(token).patch<ApiRes<Staff>>(`/users/${id}`, dto);
    return res.data;
  },

  async toggleActivate(id: number, isActive: boolean, token?: string | null): Promise<void> {
    await apiWithToken(token).patch(`/users/toggle-activate/${id}`, { isActive });
  },

  async remove(id: number, token?: string | null): Promise<void> {
    await apiWithToken(token).delete(`/users/${id}`);
  },
};
