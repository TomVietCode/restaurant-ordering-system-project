import { apiWithToken } from '@/lib/api';
import type { Order, OrderItem, OrderStatus, PaymentMethod } from '@/types/order';

// ──────────────────────────────────────────────────────────────
// Backend response types
// ──────────────────────────────────────────────────────────────

/** Shape of a single order item as returned by the backend (TypeORM entity). */
interface BackendOrderItem {
  orderId: number;
  itemId: number;
  quantity: number;
  /** Price snapshot at order time — mapped to `price` / `unitPrice` on frontend. */
  priceAtOrder: number;
  note: string | null;
  /** Joined Item entity — contains the menu item's name. */
  item: { id: number; name: string; price: number };
}

/** Shape of a single order as returned by the backend (TypeORM entity). */
interface BackendOrder {
  id: number;
  tableId: string;
  trackingCode: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  /** Joined Table entity — contains the table's name. */
  table: { id: string; name: string };
  orderItems: BackendOrderItem[];
}

/**
 * Backend envelope for paginated responses.
 *
 * Example:
 * ```json
 * { "success": true, "data": { "items": [...], "page": 1, "limit": 100, "total": 5, "totalPages": 1 } }
 * ```
 */
interface PaginatedRes {
  success: boolean;
  data: {
    items: BackendOrder[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Backend envelope for non-paginated success responses. */
interface ApiRes<T> { success: boolean; data: T }

/**
 * Result of verifying a VNPay return callback (`GET /payments/vnpay-return`).
 *
 * The backend validates the VNPay signature, marks the order PAID on success,
 * and echoes back the order id + amount.
 */
export interface VnpayReturnResult {
  success: boolean;
  message: string;
  data?: { orderId: number; amount: number };
}

// ──────────────────────────────────────────────────────────────
// Mapper: backend → frontend
// ──────────────────────────────────────────────────────────────

/**
 * Converts a single backend order entity into the frontend `Order` shape.
 *
 * Key differences:
 * ─ Backend uses `orderItems[].item.name` + `orderItems[].priceAtOrder`
 * ─ Frontend uses `items[].name` + `items[].price` + `items[].unitPrice`
 * ─ Backend has `table.name`; frontend uses `tableName` (flat string)
 */
function mapOrder(raw: BackendOrder): Order {
  const items: OrderItem[] = (raw.orderItems ?? []).map((oi) => ({
    name: oi.item?.name ?? 'Unknown',
    quantity: oi.quantity,
    price: Number(oi.priceAtOrder),
    unitPrice: Number(oi.priceAtOrder),
    note: oi.note ?? undefined,
  }));

  return {
    id: raw.id,
    tableId: raw.tableId,
    tableName: raw.table?.name ?? `Table ${raw.tableId.slice(0, 6)}`,
    status: raw.status,
    items,
    totalAmount: Number(raw.totalAmount),
    createdAt: raw.createdAt,
    trackingCode: raw.trackingCode,
    paymentMethod: (raw.paymentMethod as PaymentMethod) ?? null,
    paidAt: raw.paidAt,
    cancelReason: raw.cancelReason,
  };
}

// ──────────────────────────────────────────────────────────────
// Service
// ──────────────────────────────────────────────────────────────

export interface OrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  dateFilter?: 'all' | 'today' | 'week' | 'month';
  tableId?: string;
}

export interface OrdersPageResult {
  items: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const orderService = {
  /**
   * Fetch orders for the kitchen board (only NEW and PREPARING).
   *
   * Uses high `limit` to grab all active orders in one request.
   * For a small restaurant this is more efficient than paginating.
   */
  async getKitchenOrders(token?: string | null): Promise<Order[]> {
    const res = await apiWithToken(token).get<PaginatedRes>(
      '/orders?limit=100',
    );
    return res.data.items
      .filter((o) => o.status === 'PREPARING')
      .map(mapOrder);
  },

  /**
   * Fetch orders for the cashier board (NEW, PREPARING, SERVED).
   *
   * Fetches all orders with a high limit, then filters out
   * terminal statuses (PAID, CANCEL) client-side.
   *
   * Why not pass `status=NEW,PREPARING,SERVED`?
   * → Backend `QueryOrdersDto` only accepts a single `OrderStatus` enum value.
   */
  async getCashierOrders(token?: string | null): Promise<Order[]> {
    const res = await apiWithToken(token).get<PaginatedRes>(
      '/orders?limit=100',
    );
    return res.data.items
      .filter((o) => ['NEW', 'PREPARING', 'SERVED'].includes(o.status))
      .map(mapOrder);
  },

  /**
   * Fetch một trang đơn hàng cho bảng lịch sử đơn (Owner, `(admin)/orders`).
   * Lọc/tìm kiếm/phân trang đều SERVER-SIDE (khác getCashierOrders/getKitchenOrders
   * vốn fetch-all-rồi-lọc-client vì chỉ cần orders đang hoạt động).
   */
  async getOrdersPage(q: OrdersQuery, token?: string | null): Promise<OrdersPageResult> {
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => { if (v !== undefined && v !== '') p.set(k, String(v)); });
    const res = await apiWithToken(token).get<PaginatedRes>(`/orders?${p}`);
    return { ...res.data, items: res.data.items.map(mapOrder) };
  },

  /**
   * Fetch a single order by ID.
   * Used when a WebSocket `order:new` event fires — we need the full order data.
   */
  async getOrderById(token: string | null | undefined, id: number): Promise<Order> {
    const res = await apiWithToken(token).get<ApiRes<BackendOrder>>(
      `/orders/${id}`,
    );
    return mapOrder(res.data);
  },

  /**
   * Update an order's status (state machine transition).
   *
   * Calls: `PATCH /orders/:id/status` with `{ status }`.
   * The backend validates the transition is allowed (e.g. NEW → PREPARING).
   */
  async updateStatus(
    token: string | null | undefined,
    id: number,
    status: OrderStatus,
  ): Promise<void> {
    await apiWithToken(token).patch(`/orders/${id}/status`, { status });
  },

  /**
   * Cancel an order by setting its status to CANCEL.
   *
   * Same endpoint as `updateStatus`, just with status = 'CANCEL'.
   */
  async cancelOrder(
    token: string | null | undefined,
    id: number,
    cancelReason?: string,
  ): Promise<void> {
    await apiWithToken(token).patch(`/orders/${id}/status`, {
      status: 'CANCEL',
      cancelReason,
    });
  },

  /**
   * Pay ALL active orders for a table at once (bulk checkout).
   *
   * Calls: `POST /payments/checkout-table/:tableId` with `{ paymentMethod }`.
   */
  async payTable(
    token: string | null | undefined,
    tableId: string,
    paymentMethod: 'CASH' | 'TRANSFER',
  ): Promise<void> {
    await apiWithToken(token).post(
      `/payments/checkout-table/${tableId}`,
      { paymentMethod },
    );
  },

  /**
   * Pay specific orders (split checkout).
   *
   * Calls: `POST /payments/checkout-orders` with `{ tableId, orderIds, paymentMethod }`.
   * Used for single-order payment in the orders tab and multi-select in the tables tab.
   */
  async payOrders(
    token: string | null | undefined,
    tableId: string,
    orderIds: number[],
    paymentMethod: 'CASH' | 'TRANSFER',
  ): Promise<void> {
    await apiWithToken(token).post('/payments/checkout-orders', {
      tableId,
      orderIds,
      paymentMethod,
    });
  },

  /**
   * Create a VNPay payment for a SINGLE order (bank-transfer flow).
   *
   * Calls: `POST /payments/:id/pay` → signed VNPay payment-page URL (string).
   * The backend requires the order to be in `SERVED` status. The caller then
   * redirects the browser to this URL; VNPay sends the user back to the
   * `vnp_ReturnUrl` (our `/cashier/payment-return` page) once finished.
   *
   * ⚠️ Backend supports per-order VNPay only — there is no combined-table
   * VNPay endpoint, so this is used for single-order checkout exclusively.
   */
  async createVnpayPaymentUrl(
    token: string | null | undefined,
    orderId: number,
  ): Promise<string> {
    const res = await apiWithToken(token).post<ApiRes<string>>(
      `/payments/${orderId}/pay`,
    );
    return res.data;
  },

  /**
   * Verify a VNPay return callback against the backend.
   *
   * Called from the `/cashier/payment-return` page with the raw VNPay query
   * string. The backend (`GET /payments/vnpay-return`) validates the signature,
   * marks the order PAID on success, and returns the result. Public endpoint —
   * no token required.
   *
   * @param query Raw query string from the return URL (without the leading `?`).
   */
  async verifyVnpayReturn(query: string): Promise<VnpayReturnResult> {
    return apiClient.get<VnpayReturnResult>(`/payments/vnpay-return?${query}`);
  },
};
