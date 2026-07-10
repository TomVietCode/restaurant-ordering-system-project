export type TableStatus = 'AVAILABLE' | 'CLOSED' | 'OCCUPIED';

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  createdAt?: string;
}

export const TABLE_STATUS_LABEL: Record<TableStatus, string> = {
  AVAILABLE: 'Trống',
  CLOSED:    'Đóng',
  OCCUPIED:  'Có khách',
};

export const TABLE_STATUS_CLASS: Record<TableStatus, string> = {
  AVAILABLE: 'bg-status-paid text-status-paid-foreground',
  CLOSED:    'bg-muted text-muted-foreground',
  OCCUPIED:  'bg-status-cancel text-status-cancel-foreground',
};
