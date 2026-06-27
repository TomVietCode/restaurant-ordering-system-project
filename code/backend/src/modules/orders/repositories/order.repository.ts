import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseRepository } from '@common/repositories/base.repository.js';
import { Order } from '@modules/orders/entities/order.entity.js';
import { IOrderRepository, OrderQueryOptions } from './order.repository.interface.js';
import { OrderStatus } from '@common/enums.js';

const ACTIVE_STATUSES = [OrderStatus.NEW, OrderStatus.PREPARING, OrderStatus.SERVED];

@Injectable()
export class OrderRepository extends BaseRepository<Order> implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {
    super(orderRepo);
  }

  async findByTrackingCode(trackingCode: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { trackingCode },
      relations: { orderItems: { item: true } },
    });
  }

  /**
   * Override base findById to eagerly load order items + menu item details.
   */
  override async findById(id: number | string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { id: id as number },
      relations: { orderItems: { item: true }, table: true },
    });
  }

  async findPaginated(options: OrderQueryOptions): Promise<[Order[], number]> {
    const { page, limit, status, tableId } = options;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.item', 'item')
      .leftJoinAndSelect('order.table', 'table');

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    if (tableId) {
      qb.andWhere('order.tableId = :tableId', { tableId });
    }

    // Most recent orders first
    qb.orderBy('order.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    return qb.getManyAndCount();
  }

  async findActiveOrdersByTableId(tableId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: {
        tableId,
        status: In(ACTIVE_STATUSES),
      },
    });
  }

  async countActiveOrdersByTableId(tableId: string): Promise<number> {
    return this.orderRepo.count({
      where: {
        tableId,
        status: In(ACTIVE_STATUSES),
      },
    });
  }
}
