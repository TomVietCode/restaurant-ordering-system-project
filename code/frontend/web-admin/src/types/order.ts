export type OrderStatus = 'NEW' | 'PREPARING' | 'SERVED' | 'PAID' | 'CANCEL';

export interface OrderItem {
  name: string;
  quantity: number;
  note?: string;
  /** Unit price at order time (mapped from backend `priceAtOrder`). */
  price?: number;
  /** Alias of `price` — used in the 4-column payment table display. */
  unitPrice?: number;
}

export interface Order {
  id: number;
  tableId: string;
  tableName: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string; // ISO string
  trackingCode: string;
}
