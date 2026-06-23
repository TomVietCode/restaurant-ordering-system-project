import { Injectable, Inject, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { randomUUID } from 'crypto';
import { ORDER_REPO_TOKEN, REALTIME_SERVICE_TOKEN } from '@common/constants.js';
import { OrderStatus } from '@common/enums.js';
import type { IOrderRepository, OrderQueryOptions } from './repositories/order.repository.interface.js';
import type { IRealtimeService } from '@modules/realtime/realtime.service.interface.js';
import { TableService } from '@modules/tables/table.service.js';
import { ItemsService } from '@modules/items/item.service.js';
import { CreateOrderDto } from './dtos/create-order.dto.js';
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto.js';
import { CheckoutTableDto } from './dtos/checkout-table.dto.js';
import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { PaginationDto } from '@common/dtos/pagination.dto.js';

const STATE_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [OrderStatus.PREPARING, OrderStatus.CANCEL],
  [OrderStatus.PREPARING]: [OrderStatus.SERVED, OrderStatus.CANCEL],
  [OrderStatus.SERVED]: [OrderStatus.PAID, OrderStatus.CANCEL],
  [OrderStatus.PAID]: [],
  [OrderStatus.CANCEL]: [],
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(ORDER_REPO_TOKEN)
    private readonly orderRepository: IOrderRepository,

    private readonly tableService: TableService,
    private readonly itemsService: ItemsService,

    @Inject(REALTIME_SERVICE_TOKEN)
    private readonly realtimeService: IRealtimeService,

    private readonly dataSource: DataSource,
  ) {}

  //  PUBLIC CUSTOMER ENDPOINTS

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // 1. Validate table
    const table = await this.tableService.findById(dto.tableId);

    // 2. Validate items and snapshot prices
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const orderItemDto of dto.items) {
      const item = await this.itemsService.findById(orderItemDto.itemId);

      // Check soft-delete (findById in ItemsService already throws if not found,
      // but withDeleted could change that, so double-check)
      if (item.deletedAt !== null) {
        throw new BadRequestException(`Item "${item.name}" has been removed from the menu.`);
      }

      // Check stock availability
      if (!item.isRemain) {
        throw new BadRequestException(`Item "${item.name}" is out of stock. Please remove it from your cart.`);
      }

      const oi = new OrderItem();
      oi.itemId = item.id;
      oi.quantity = orderItemDto.quantity;
      oi.priceAtOrder = item.price;
      oi.note = orderItemDto.note ?? null;

      totalAmount += Number(item.price) * orderItemDto.quantity;
      orderItems.push(oi);
    }

    // 3. Build the order entity
    const order = new Order();
    order.tableId = table.id;
    order.trackingCode = randomUUID();
    order.status = OrderStatus.NEW;
    order.totalAmount = totalAmount;
    order.orderItems = orderItems;

    // 4. Save in a transaction
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(Order, order);

      // 5. Mark table as occupied if it was previously free
      if (table.isAvailable) {
        table.isAvailable = false;
        await manager.save(table);
      }

      return saved;
    });

    // 6. Emit realtime event to staff
    this.realtimeService.emit('order:new', {
      orderId: savedOrder.id,
      tableId: savedOrder.tableId,
      totalAmount: savedOrder.totalAmount,
      status: savedOrder.status,
    });

    this.logger.log(`Order #${savedOrder.id} created for table ${table.name} (tracking: ${savedOrder.trackingCode})`);

    return savedOrder;
  }

  /**
   * Track an order by its public tracking code (customer-facing).
   */
  async trackOrder(trackingCode: string): Promise<Order> {
    const order = await this.orderRepository.findByTrackingCode(trackingCode);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  //  PROTECTED ADMIN / STAFF ENDPOINTS

  async findAll(query: OrderQueryOptions): Promise<PaginationDto<Order>> {
    const [orders, total] = await this.orderRepository.findPaginated(query);

    const pagination = new PaginationDto<Order>();
    pagination.items = orders;
    pagination.page = query.page;
    pagination.limit = query.limit;
    pagination.total = total;
    pagination.totalPages = Math.ceil(total / query.limit);

    return pagination;
  }

  async findById(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findById(id);

    // Validate state transition
    const allowedNextStatuses = STATE_TRANSITIONS[order.status];
    if (!allowedNextStatuses.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${dto.status}`);
    }

    // Handle PAID-specific logic
    if (dto.status === OrderStatus.PAID) {
      if (!dto.paymentMethod) {
        throw new BadRequestException('Payment method is required');
      }
      order.paymentMethod = dto.paymentMethod;
      order.paidAt = new Date();
    }

    // Handle CANCEL-specific logic
    if (dto.status === OrderStatus.CANCEL) {
      order.cancelReason = dto.cancelReason ?? null;
    }

    order.status = dto.status;

    // Save order and optionally free the table
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(Order, order);

      // After PAID or CANCEL, check if all orders for this table are now terminal
      if (dto.status === OrderStatus.PAID || dto.status === OrderStatus.CANCEL) {
        await this.freeTableIfAllPaid(saved.tableId, manager);
      }

      return saved;
    });

    // Emit status change to the order's tracking room + staff broadcast
    const payload = {
      trackingCode: savedOrder.trackingCode,
      orderId: savedOrder.id,
      status: savedOrder.status,
    };
    this.realtimeService.emitToRoom(`order:track:${savedOrder.trackingCode}`, 'order:status-changed', payload);
    this.realtimeService.emit('order:status-changed', payload);

    this.logger.log(`Order #${savedOrder.id} status → ${savedOrder.status}`);

    return savedOrder;
  }

  /**
   * Bulk checkout: mark all active orders for a table as PAID in one transaction.
   */
  async checkoutTable(tableId: string, dto: CheckoutTableDto): Promise<Order[]> {
    // Validate table exists
    await this.tableService.findById(tableId);

    const activeOrders = await this.orderRepository.findActiveOrdersByTableId(tableId);

    if (activeOrders.length === 0) {
      throw new BadRequestException('No active orders found for this table');
    }

    const now = new Date();
    const paidOrders = await this.dataSource.transaction(async (manager) => {
      for (const order of activeOrders) {
        order.status = OrderStatus.PAID;
        order.paymentMethod = dto.paymentMethod;
        order.paidAt = now;
      }

      const saved = await manager.save(Order, activeOrders);

      // Free the table since all orders are now paid
      const table = await this.tableService.findById(tableId);
      table.isAvailable = true;
      await manager.save(table);

      return saved;
    });

    // Emit status change for each order
    for (const order of paidOrders) {
      const payload = {
        trackingCode: order.trackingCode,
        orderId: order.id,
        status: order.status,
      };
      this.realtimeService.emitToRoom(`order:track:${order.trackingCode}`, 'order:status-changed', payload);
      this.realtimeService.emit('order:status-changed', payload);
    }

    this.logger.log(`Bulk checkout: ${paidOrders.length} orders paid for table ${tableId}`);

    return paidOrders;
  }

  // ────────────────────────────────────────────────────────────
  //  PRIVATE HELPERS
  // ────────────────────────────────────────────────────────────

  /**
   * Check if all orders for a table are terminal (PAID or CANCEL).
   * If so, set the table as available (free).
   */
  private async freeTableIfAllPaid(tableId: string, manager: EntityManager): Promise<void> {
    const activeCount = await this.orderRepository.countActiveOrdersByTableId(tableId);

    if (activeCount === 0) {
      const table = await this.tableService.findById(tableId);
      table.isAvailable = true;
      await manager.save(table);
      this.logger.log(`Table ${table.name} is now free (all orders terminal)`);
    }
  }
}
