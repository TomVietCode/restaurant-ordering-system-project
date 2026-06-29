import { apiWithToken } from "@/lib/api";
import type { Table } from "@/types/table";

/** Backend envelope: `{ success: true, data: [...] }` */
interface ApiRes<T> {
  success: boolean;
  data: T;
}

export const tableService = {
  /**
   * Fetch all tables.
   *
   * Calls: `GET /tables`
   * The backend wraps the response in `ApiResponseDto.success(data)`,
   * which produces `{ success: true, data: [...] }`.
   * Our fetch wrapper (`apiWithToken`) returns the full JSON body,
   * so we access `res.data` to get the actual array.
   */
  async getAll(token?: string | null): Promise<Table[]> {
    const res = await apiWithToken(token).get<ApiRes<Table[]>>("/tables");
    return res.data;
  },

  /**
   * Create a new table.
   *
   * Calls: `POST /tables` with `{ name, capacity? }`
   */
  async create(
    token: string | null | undefined,
    dto: { name: string; capacity?: number },
  ): Promise<Table> {
    const res = await apiWithToken(token).post<ApiRes<Table>>("/tables", dto);
    return res.data;
  },

  /**
   * Update an existing table.
   *
   * Calls: `PATCH /tables/:id` with partial fields.
   */
  async update(
    token: string | null | undefined,
    id: string,
    dto: Partial<{ name: string; capacity: number; isAvailable: boolean }>,
  ): Promise<Table> {
    const res = await apiWithToken(token).patch<ApiRes<Table>>(
      `/tables/${id}`,
      dto,
    );
    return res.data;
  },

  /**
   * Delete a table.
   *
   * Calls: `DELETE /tables/:id`
   */
  async remove(token: string | null | undefined, id: string): Promise<void> {
    await apiWithToken(token).delete(`/tables/${id}`);
  },
};
