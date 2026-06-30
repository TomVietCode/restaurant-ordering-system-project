import { BaseRepository } from '@common/repositories/base.repository';
import { Order } from '@modules/orders/entities/order.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Between } from 'typeorm/browser';
import { OrderStatus } from '@common/enums';
import { IReportRepository } from './report.repository.interface';
import { OrderItem } from '@modules/orders/entities/order-item.entity';
import { TopSellingItem } from '../dtos/dtos';

@Injectable()
export class ReportRepository extends BaseRepository<Order> implements IReportRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {
    super(orderRepo);
  }

  async getOrdersBetween(start: Date, end: Date): Promise<Order[]> {
    // Lấy tất cả order trong khoảng thời gian
    const orders = await this.orderRepo.find({
      where: {
        createdAt: Between(start, end),
        status: OrderStatus.PAID,
      },
    });
    return orders;
  }

  async getReportBetween(start: Date, end: Date): Promise<{ totalRevenue: number; totalOrders: number }> {
    const orders = await this.getOrdersBetween(start, end);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    return {
      totalRevenue,
      totalOrders,
    };
  }

  async getTopSellingItems(start: Date, end: Date): Promise<TopSellingItem[]> {
    return this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .innerJoin('oi.item', 'i')
      .select('oi.itemId', 'itemId')
      .addSelect('i.name', 'itemName')
      .addSelect('SUM(oi.quantity)', 'totalQuantity')
      .addSelect('SUM(oi.quantity * oi.priceAtOrder)', 'totalRevenue')
      .where('o.status = :status', {
        status: OrderStatus.PAID,
      })
      .andWhere('o.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('oi.itemId')
      .addGroupBy('i.name')
      .orderBy('SUM(oi.quantity)', 'DESC')
      .limit(10)
      .getRawMany<TopSellingItem>();
  }

  async getCurrentWeekRevenueTrend(start: Date, end: Date): Promise<{ date: string; revenue: number }[]> {
    return this.orderRepo
      .createQueryBuilder('o')
      .select('DATE(o.createdAt)', 'date')
      .addSelect('SUM(o.totalAmount)', 'revenue')
      .where('o.status = :status', {
        status: OrderStatus.PAID,
      })
      .andWhere('o.createdAt >= :start', { start })
      .andWhere('o.createdAt < :end', { end })
      .groupBy('DATE(o.createdAt)')
      .orderBy('DATE(o.createdAt)')
      .getRawMany();
  }
}
