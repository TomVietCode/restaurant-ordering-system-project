export type OrderStatus = 'NEW' | 'PREPARING' | 'SERVED' | 'PAID' | 'CANCEL';
export type PaymentMethod = 'CASH' | 'TRANSFER';

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
  paymentMethod: PaymentMethod | null;
  paidAt: string | null; // ISO string, chỉ có giá trị khi status = PAID
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: 'Mới',
  PREPARING: 'Đang chuẩn bị',
  SERVED: 'Đã phục vụ',
  PAID: 'Đã thanh toán',
  CANCEL: 'Đã hủy',
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  NEW: 'bg-status-new text-status-new-foreground',
  PREPARING: 'bg-status-preparing text-status-preparing-foreground',
  SERVED: 'bg-status-served text-status-served-foreground',
  PAID: 'bg-status-paid text-status-paid-foreground',
  CANCEL: 'bg-status-cancel text-status-cancel-foreground',
};
