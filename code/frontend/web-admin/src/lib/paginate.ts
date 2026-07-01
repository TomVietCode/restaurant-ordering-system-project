export interface PageResult<T> {
  total: number;       
  totalPages: number;  
  page: number;        
  rows: T[];           
}

export function selectPage<T>(rows: T[], page: number, pageSize: number): PageResult<T> {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safe = Math.min(Math.max(1, page), totalPages);
  return { total, totalPages, page: safe, rows: rows.slice((safe - 1) * pageSize, safe * pageSize) };
}
