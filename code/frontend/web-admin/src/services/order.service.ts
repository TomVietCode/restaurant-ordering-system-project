// file mock dữ liệu tạm thời
import { apiWithToken } from '@/lib/api';
import type { Order, OrderStatus } from '@/types/order';

// ─── đổi thành false khi backend có /orders ───
const MOCK_MODE = true;

const MOCK_ORDERS: Order[] = [
  {
    id: 1, tableId: 'uuid-05', tableName: 'Bàn 05', status: 'NEW',
    createdAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    items: [
      { name: 'Cà phê sữa đá', quantity: 2, note: 'Ít đường, không đá' },
      { name: 'Trà đào cam sả', quantity: 1 },
      { name: 'Bánh croissant', quantity: 1 },
       { name: '424234', quantity: 1 },
      { name: '4234234234234t', quantity: 1 },
       { name: '4234234tb 2', quantity: 1 },
      { name: '42342b4234setfwe', quantity: 1 },

    ],
    totalAmount: 115_000,
  },
   {
    id: 7, tableId: 'uuid-12', tableName: 'Bàn 12', status: 'NEW',
    createdAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    items: [
      { name: 'Cà phê sữa đá', quantity: 2, note: 'Ít đường, không đá' },
      { name: 'Trà đào cam sả', quantity: 1 },
      { name: 'Bánh croissant', quantity: 1 },
       { name: 'Trà đào cam sả', quantity: 1 },
      { name: 'Bánh croissant', quantity: 1 },
       { name: 'Trà đào cam sả', quantity: 1 },
      { name: 'Bánh croissant', quantity: 1 },
    ],
    totalAmount: 115_000,
  },
  {
    id: 3, tableId: 'uuid-03', tableName: 'Bàn 03', status: 'SERVED',
    createdAt: new Date(Date.now() - 15 * 60_000).toISOString(),
    items: [
      { name: 'Sinh tố xoài', quantity: 2 },
      { name: 'Bánh mì chảo', quantity: 1, note: 'Thêm pate' },
    ],
    totalAmount: 117_000,
  },
  {
    id: 4, tableId: 'uuid-03', tableName: 'Bàn 03', status: 'SERVED',
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    items: [{ name: 'Trà chanh', quantity: 3 }],
    totalAmount: 75_000,
  },
];

interface ApiRes<T> { data: T }

export const orderService = {
  async getKitchenOrders(token?: string | null): Promise<Order[]> {
    if (MOCK_MODE) return MOCK_ORDERS.filter(o => o.status === 'NEW' || o.status === 'PREPARING');
    const res = await apiWithToken(token).get<ApiRes<Order[]>>('/orders?status=NEW,PREPARING');
    return res.data;
  },

  async getCashierOrders(token?: string | null): Promise<Order[]> {
    if (MOCK_MODE) return MOCK_ORDERS;
    const res = await apiWithToken(token).get<ApiRes<Order[]>>('/orders?status=NEW,PREPARING,SERVED');
    return res.data;
  },

  async updateStatus(token: string | null | undefined, id: number, status: OrderStatus): Promise<void> {
    if (MOCK_MODE) return;
    await apiWithToken(token).patch(`/orders/${id}`, { status });
  },

  async cancelOrder(token: string | null | undefined, id: number): Promise<void> {
    if (MOCK_MODE) return;
    await apiWithToken(token).patch(`/orders/${id}`, { status: 'CANCEL' });
  },

  async payTable(token: string | null | undefined, tableId: string, paymentMethod: 'CASH' | 'TRANSFER'): Promise<void> {
    if (MOCK_MODE) return;
    await apiWithToken(token).post('/orders/pay', { tableId, paymentMethod });
  },
};
