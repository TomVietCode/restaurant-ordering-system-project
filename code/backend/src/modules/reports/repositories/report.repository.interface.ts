import { IBaseRepository } from '@common/repositories/base.repository.interface';
import { Order } from '@modules/orders/entities/order.entity';
import { TopSellingItem } from '../dtos/dtos';

export interface IReportRepository extends IBaseRepository<Order> {
  getOrdersBetween(start: Date, end: Date): Promise<Order[]>;
  getReportBetween(start: Date, end: Date): Promise<{ totalRevenue: number; totalOrders: number }>;
  getTopSellingItems(start: Date, end: Date): Promise<TopSellingItem[]>;
  getCurrentWeekRevenueTrend(start: Date, end: Date): Promise<{ date: string; revenue: number }[]>;
}
