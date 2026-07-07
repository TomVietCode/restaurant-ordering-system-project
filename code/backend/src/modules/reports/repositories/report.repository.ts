import { BaseRepository } from '@common/repositories/base.repository';
import { Order } from '@modules/orders/entities/order.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Between } from 'typeorm';
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
    // Single SQL aggregate — avoids loading all order rows into JS
    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.totalAmount), 0)', 'totalRevenue')
      .addSelect('COUNT(o.id)', 'totalOrders')
      .where('o.status = :status', { status: OrderStatus.PAID })
      .andWhere('o.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne<{ totalRevenue: string; totalOrders: string }>();

    return {
      totalRevenue: Number(result?.totalRevenue ?? 0),
      totalOrders: Number(result?.totalOrders ?? 0),
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

  async getMonthlyWeeklyTrend(
    firstDay: Date,
    lastDay: Date,
  ): Promise<{ weekStart: string; totalRevenue: number; totalOrders: number }[]> {
    // Single query: aggregate revenue per ISO week within the date range.
    // date_trunc('week', ...) returns the Monday of each week.
    return this.orderRepo
      .createQueryBuilder('o')
      .select("TO_CHAR(date_trunc('week', o.created_at), 'YYYY-MM-DD')", 'weekStart')
      .addSelect('COALESCE(SUM(o.total_amount), 0)', 'totalRevenue')
      .addSelect('COUNT(o.id)', 'totalOrders')
      .where('o.status = :status', { status: OrderStatus.PAID })
      .andWhere('o.created_at >= :firstDay', { firstDay })
      .andWhere('o.created_at <= :lastDay', { lastDay })
      .groupBy("date_trunc('week', o.created_at)")
      .orderBy("date_trunc('week', o.created_at)")
      .getRawMany();
  }
}
