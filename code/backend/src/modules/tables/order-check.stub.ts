import { Injectable } from '@nestjs/common';
import type { IOrderCheckService } from '@common/interfaces/order-check.interface';

/**
 * Temporary stub: always reports no active orders.
 *
 * TODO: Replace with real OrderCheckService from the Orders module
 * once US-XX (order lifecycle) is implemented.
 */
@Injectable()
export class OrderCheckStub implements IOrderCheckService {
  async hasActiveOrders(_tableId: string): Promise<boolean> {
    return true;
  }
}
