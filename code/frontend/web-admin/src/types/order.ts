export type OrderStatus = 'NEW' | 'PREPARING' | 'SERVED' | 'PAID' | 'CANCEL';

export interface OrderItem {
  name: string;
  quantity: number;
  note?: string;
}

export interface Order {
  id: number;
  tableId: string;
  tableName: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string; // ISO string
}
