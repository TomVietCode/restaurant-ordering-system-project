import { Injectable, Inject, BadRequestException, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { DataSource, EntityManager, In, QueryFailedError } from 'typeorm';
import { generateTrackingCode } from '@common/utils/tracking-code.util.js';
import { ORDER_REPO_TOKEN, REALTIME_SERVICE_TOKEN } from '@common/constants.js';
import { OrderStatus, PaymentMethod, TableStatus } from '@common/enums.js';
import type { IOrderRepository, OrderQueryOptions } from './repositories/order.repository.interface.js';
import type { IRealtimeService } from '@modules/realtime/realtime.service.interface.js';
import { TableService } from '@modules/tables/table.service.js';
import { ItemsService } from '@modules/items/item.service.js';
import { CreateOrderDto } from './dtos/create-order.dto.js';
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto.js';
import { CheckoutTableDto } from './dtos/checkout-table.dto.js';
import { CheckoutOrdersDto } from './dtos/checkout-orders.dto.js';
import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { PaginationDto } from '@common/dtos/pagination.dto.js';
import { Table } from '@modules/tables/table.entity.js';
import { VnpayService } from 'nestjs-vnpay';
import { ConfigService } from '@nestjs/config';
import { VnpayIpnResponse, VnpayReturn } from './dtos/vnpay-ipn-response.js';

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

    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService,
  ) {}

  //  PUBLIC CUSTOMER ENDPOINTS

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // 1. Validate table
    const table = await this.tableService.findById(dto.tableId);
    if (table.status === TableStatus.CLOSED) {
      throw new BadRequestException('Table is currently closed');
    }

    // 2. Validate items and snapshot prices
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    const itemIds = [...new Set(dto.items.map((i) => i.itemId))];
    const items = await this.itemsService.findByIds(itemIds);
    const itemsMap = new Map(items.map((item) => [item.id, item]));

    for (const orderItemDto of dto.items) {
      const item = itemsMap.get(orderItemDto.itemId);
      if (!item) {
        throw new NotFoundException(`Item with ID ${orderItemDto.itemId} not found`);
      }

      // Check soft-delete
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
    order.trackingCode = generateTrackingCode();
    order.status = OrderStatus.NEW;
    order.totalAmount = totalAmount;
    order.orderItems = orderItems;

    // 4. Save in a transaction
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(Order, order);

      // 5. Mark table as occupied if it was previously free
      if (table.status === TableStatus.AVAILABLE) {
        table.status = TableStatus.OCCUPIED;
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
      const table = await manager.findOne(Table, { where: { id: tableId } });
      if (table) {
        table.status = TableStatus.AVAILABLE;
        await manager.save(table);
      }

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

  async checkoutOrders(dto: CheckoutOrdersDto): Promise<Order[]> {
    const { tableId, orderIds, paymentMethod } = dto;

    // Validate table exists
    await this.tableService.findById(tableId);

    // Fetch matching orders
    const orders = await this.orderRepository.findWithOptions({
      where: {
        id: In(orderIds),
      },
    });

    // Validate all requested orders were found
    if (orders.length !== orderIds.length) {
      throw new NotFoundException('One or more orders not found');
    }

    // Validate orders belong to the specified table
    const invalidTableOrder = orders.find((o) => o.tableId !== tableId);
    if (invalidTableOrder) {
      throw new BadRequestException(`Order #${invalidTableOrder.id} does not belong to table ${tableId}`);
    }

    // Validate all orders are currently active (not PAID or CANCEL)
    const nonActiveOrders = orders.filter((o) => o.status === OrderStatus.PAID || o.status === OrderStatus.CANCEL);
    if (nonActiveOrders.length > 0) {
      const nonActiveIds = nonActiveOrders.map((o) => o.id).join(', ');
      throw new BadRequestException(`Order(s) with ID(s) ${nonActiveIds} are already paid or cancelled`);
    }

    const now = new Date();
    const paidOrders = await this.dataSource.transaction(async (manager) => {
      for (const order of orders) {
        order.status = OrderStatus.PAID;
        order.paymentMethod = paymentMethod;
        order.paidAt = now;
      }

      const saved = await manager.save(Order, orders);

      // Check if all orders for this table are now terminal inside the transaction
      const activeCount = await manager.count(Order, {
        where: {
          tableId,
          status: In([OrderStatus.NEW, OrderStatus.PREPARING, OrderStatus.SERVED]),
        },
      });

      if (activeCount === 0) {
        const table = await manager.findOne(Table, { where: { id: tableId } });
        if (table) {
          table.status = TableStatus.AVAILABLE;
          await manager.save(table);
        }
      }

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

    this.logger.log(`Split checkout: ${paidOrders.length} orders paid for table ${tableId}`);

    return paidOrders;
  }

  // ────────────────────────────────────────────────────────────
  //  PAYMENT BUSSINESS
  // ────────────────────────────────────────────────────────────
  async getBankList() {
    return await this.vnpayService.getBankList();
  }

  async createPaymentQr(orderId: number, ipAddr: string): Promise<any> {
    const order = await this.findById(orderId);

    if (order.status !== OrderStatus.SERVED) {
      throw new BadRequestException('Order is not payable');
    }

    const paymentUrl = this.vnpayService.generateQr({
      vnp_Amount: order.totalAmount,
      vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
      vnp_TxnRef: order.id.toString(),
      vnp_IpAddr: ipAddr,
      vnp_ReturnUrl: this.configService.getOrThrow<string>('VNPAY_RETURN_URL') || 'http://localhost:3000/api/payments/vnpay-return',
    });
    return paymentUrl;
  }

  async handleVnpayIpn(query: any): Promise<VnpayIpnResponse> {
    // const isValid = await this.vnpayService.verifyIpnCall(query);
    // if (!isValid) {
    //   return { RspCode: '97', Message: 'Invalid signature' };
    // }
    // if (!query.vnp_ResponseCode) {
    //   return { RspCode: '99', Message: 'Missing response code' };
    // }

    const orderId = Number(query.vnp_TxnRef);
    if (Number.isNaN(orderId)) {
      return { RspCode: '01', Message: 'Invalid TxnRef' };
    }

    const order = await this.findById(orderId);

    if (!order) {
      return { RspCode: '01', Message: 'Order not found' };
    }

    if (Number(query.vnp_Amount) !== order.totalAmount * 100) {
      return { RspCode: '00', Message: 'Invalid amount' };
    }
    if (order.status !== OrderStatus.SERVED) {
      return { RspCode: '00', Message: 'Order status invalid' };
    }

    if (query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00') {
      order.paidAt = new Date();
      order.paymentMethod = PaymentMethod.TRANSFER;
      order.status = OrderStatus.PAID;
      await this.orderRepository.save(order);
      return { RspCode: '00', Message: 'Success' };
    }

    return { RspCode: '04', Message: 'Failed recorded' };
  }

  async handleVnpayReturn(query: any): Promise<VnpayReturn> {
    const result = await this.handleVnpayIpn(query);
    if(result.Message !== 'Success') {
      console.log("VNPay return failed: ", result);
      return { isSuccess: false, message: result.Message };
    }

    const isValid = await this.vnpayService.verifyReturnUrl(query);
    if (!isValid) {
      return { isSuccess: false, message: 'Invalid signature' };
    }

    const orderId = Number(query.vnp_TxnRef);

    if (Number.isNaN(orderId)) {
      return { isSuccess: false, message: 'Invalid transaction reference' };
    }

    const order = await this.findById(orderId);

    if (!order) {
      return { isSuccess: false, message: 'Order not found' };
    }
    if (Number(query.vnp_Amount) !== order.totalAmount * 100) {
      return { isSuccess: false, message: 'Invalid amount' };
    }

    const isSuccess = query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00';

    return {
      isSuccess: isSuccess,
      data: { orderId: order.id, amount: order.totalAmount },
      message: isSuccess ? 'Payment successful' : 'Payment failed',
    };
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
      table.status = TableStatus.AVAILABLE;
      await manager.save(table);
      this.logger.log(`Table ${table.name} is now free (all orders terminal)`);
    }
  }

  /**
   * Check if the generated nanoid already exists
   * if not, return Tracking Code
   */
  private async generateTrackingCode(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const trackingCode = generateTrackingCode();
      const existed = await this.orderRepository.findByTrackingCode(trackingCode);

      if (existed) {
        continue;
      }
      return trackingCode;
    }

    throw new InternalServerErrorException('Unable to generate unique tracking code after 5 attempts.');
  }
}
