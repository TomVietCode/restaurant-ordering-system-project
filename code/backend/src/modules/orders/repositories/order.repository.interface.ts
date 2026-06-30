import { IBaseRepository } from '@common/repositories/base.repository.interface.js';
import { Order } from '@modules/orders/entities/order.entity.js';
import { OrderStatus } from '@common/enums.js';

export interface OrderQueryOptions {
  page: number;
  limit: number;
  status?: OrderStatus;
  tableId?: string;
  search?: string;
  dateFilter?: 'all' | 'today' | 'week' | 'month';
}


export interface IOrderRepository extends IBaseRepository<Order> {
  /** Find an order by its public tracking code, including order items + item details. */
  findByTrackingCode(trackingCode: string): Promise<Order | null>;

  /** Paginated order list with optional status/table filters. Includes order items. */
  findPaginated(options: OrderQueryOptions): Promise<[Order[], number]>;

  /** Fetch all active (unpaid, not cancelled) orders for a specific table. */
  findActiveOrdersByTableId(tableId: string): Promise<Order[]>;

  /** Count active orders for a table (status NOT IN PAID, CANCEL). */
  countActiveOrdersByTableId(tableId: string): Promise<number>;
}
