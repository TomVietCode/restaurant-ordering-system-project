import { Injectable, Inject } from '@nestjs/common';
import type { IOrderCheckService } from '@common/interfaces/order-check.interface.js';
import type { IOrderRepository } from './repositories/order.repository.interface.js';
import { ORDER_REPO_TOKEN } from '@common/constants.js';

/**
 * Implements IOrderCheckService so that TableModule can check
 * whether a table has active (unpaid, non-cancelled) orders
 * without depending directly on the full OrdersService.
 */
@Injectable()
export class OrderCheckService implements IOrderCheckService {
  constructor(
    @Inject(ORDER_REPO_TOKEN)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async hasActiveOrders(tableId: string): Promise<boolean> {
    const count = await this.orderRepository.countActiveOrdersByTableId(tableId);
    return count > 0;
  }
}
