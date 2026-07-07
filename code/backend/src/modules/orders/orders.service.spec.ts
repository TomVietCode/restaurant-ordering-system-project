jest.mock('nanoid', () => {
  let count = 0;
  return {
    customAlphabet: () => () => `ABCDEFGH_${count++}`,
  };
});


import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { OrdersService } from './orders.service.js';
import { ORDER_REPO_TOKEN, REALTIME_SERVICE_TOKEN } from '@common/constants.js';
import { OrderStatus, PaymentMethod, TableStatus } from '@common/enums.js';
import { Order } from './entities/order.entity.js';
import { Table } from '@modules/tables/table.entity.js';
import { TableService } from '@modules/tables/table.service.js';
import { ItemsService } from '@modules/items/item.service.js';
import type { IOrderRepository } from './repositories/order.repository.interface.js';
import type { IRealtimeService } from '@modules/realtime/realtime.service.interface.js';
import { VnpayService } from 'nestjs-vnpay';
import { ConfigService } from '@nestjs/config';

// ────────────────────────────────────────────────────────────
//  Test Helpers: create mock objects
// ────────────────────────────────────────────────────────────

/** Creates a mock Table entity. */
function makeTable(overrides: Partial<Table> = {}): Table {
  const t = new Table();
  t.id = 'table-uuid-1';
  t.name = 'Bàn 01';
  t.capacity = 4;
  t.status = TableStatus.AVAILABLE;
  return Object.assign(t, overrides);
}

/** Creates a mock Item with price and stock. */
function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Black Coffee',
    price: 30000,
    isRemain: true,
    deletedAt: null,
    ...overrides,
  };
}

/** Creates a mock Order entity. */
function makeOrder(overrides: Partial<Order> = {}): Order {
  const o = new Order();
  o.id = 1;
  o.tableId = 'table-uuid-1';
  o.trackingCode = 'tracking-uuid-1';
  o.status = OrderStatus.NEW;
  o.totalAmount = 60000;
  o.paymentMethod = null;
  o.cancelReason = null;
  o.paidAt = null;
  o.orderItems = [];
  return Object.assign(o, overrides);
}

// ────────────────────────────────────────────────────────────
//  Test Suite
// ────────────────────────────────────────────────────────────

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepo: jest.Mocked<IOrderRepository>;
  let tableService: jest.Mocked<TableService>;
  let itemsService: jest.Mocked<ItemsService>;
  let realtimeService: jest.Mocked<IRealtimeService>;
  let dataSource: jest.Mocked<DataSource>;
  let mockManager: jest.Mocked<EntityManager>;
  let vnpayService: jest.Mocked<VnpayService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Create mock EntityManager used inside transaction callbacks
    mockManager = {
      save: jest.fn().mockImplementation((_entity, data) => Promise.resolve(data)),
      findOne: jest.fn(),
      count: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    // Create mocks for all dependencies
    orderRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findWithOptions: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      exists: jest.fn(),
      findByTrackingCode: jest.fn(),
      findPaginated: jest.fn(),
      findActiveOrdersByTableId: jest.fn(),
      countActiveOrdersByTableId: jest.fn(),
    };

    tableService = {
      findById: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<TableService>;

    itemsService = {
      findById: jest.fn(),
      findByIds: jest.fn(),
    } as unknown as jest.Mocked<ItemsService>;

    realtimeService = {
      emit: jest.fn(),
      emitToRoom: jest.fn(),
    } as jest.Mocked<IRealtimeService>;

    dataSource = {
      // transaction runs the callback with our mock manager
      transaction: jest.fn().mockImplementation((cb) => cb(mockManager)),
    } as unknown as jest.Mocked<DataSource>;

    vnpayService = {
      getBankList: jest.fn(),
      buildPaymentUrl: jest.fn(),
      verifyIpnCall: jest.fn(),
      verifyReturnUrl: jest.fn(),
    } as unknown as jest.Mocked<VnpayService>;

    configService = {
      getOrThrow: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: ORDER_REPO_TOKEN, useValue: orderRepo },
        { provide: TableService, useValue: tableService },
        { provide: ItemsService, useValue: itemsService },
        { provide: REALTIME_SERVICE_TOKEN, useValue: realtimeService },
        { provide: DataSource, useValue: dataSource },
        { provide: VnpayService, useValue: vnpayService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  // ──────────────────────────────────────────────────────────
  //  createOrder
  // ──────────────────────────────────────────────────────────

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const table = makeTable({ status: TableStatus.AVAILABLE });
      const item = makeItem();

      tableService.findById.mockResolvedValue(table);
      itemsService.findByIds.mockResolvedValue([item as any]);
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(Object.assign(data ?? _entity, { id: 1 })),
      );

      const result = await service.createOrder({
        tableId: 'table-uuid-1',
        items: [{ itemId: 1, quantity: 2 }],
      });

      // Order was created with correct values
      expect(result.tableId).toBe('table-uuid-1');
      expect(result.status).toBe(OrderStatus.NEW);
      expect(result.trackingCode).toBeDefined();
      expect(result.totalAmount).toBe(60000); // 30000 × 2

      // Table marked as occupied
      expect(table.status).toBe(TableStatus.OCCUPIED);

      // Realtime event emitted to staff
      expect(realtimeService.emit).toHaveBeenCalledWith(
        'order:new',
        expect.objectContaining({ status: OrderStatus.NEW }),
      );
    });

    it('should throw NotFoundException if any of the items do not exist', async () => {
      const table = makeTable();
      tableService.findById.mockResolvedValue(table);
      itemsService.findByIds.mockResolvedValue([]); // item not found

      await expect(
        service.createOrder({
          tableId: 'table-uuid-1',
          items: [{ itemId: 999, quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for out-of-stock items', async () => {
      const table = makeTable();
      const item = makeItem({ isRemain: false, name: 'Cappuccino' });

      tableService.findById.mockResolvedValue(table);
      itemsService.findByIds.mockResolvedValue([item as any]);

      await expect(
        service.createOrder({
          tableId: 'table-uuid-1',
          items: [{ itemId: 1, quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createOrder({
          tableId: 'table-uuid-1',
          items: [{ itemId: 1, quantity: 1 }],
        }),
      ).rejects.toThrow('out of stock');
    });

    it('should throw BadRequestException for soft-deleted items', async () => {
      const table = makeTable();
      const item = makeItem({ deletedAt: new Date(), name: 'Old Latte' });

      tableService.findById.mockResolvedValue(table);
      itemsService.findByIds.mockResolvedValue([item as any]);

      await expect(
        service.createOrder({
          tableId: 'table-uuid-1',
          items: [{ itemId: 1, quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate a unique tracking code', async () => {
      const table = makeTable();
      const item = makeItem();

      tableService.findById.mockResolvedValue(table);
      itemsService.findByIds.mockResolvedValue([item as any]);
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(Object.assign(data ?? _entity, { id: 1 })),
      );

      const order1 = await service.createOrder({
        tableId: 'table-uuid-1',
        items: [{ itemId: 1, quantity: 1 }],
      });

      // Reset table availability for second order
      table.status = TableStatus.AVAILABLE;

      const order2 = await service.createOrder({
        tableId: 'table-uuid-1',
        items: [{ itemId: 1, quantity: 1 }],
      });

      expect(order1.trackingCode).not.toBe(order2.trackingCode);
    });

    it('should not change table availability if table is already occupied', async () => {
      const table = makeTable({ status: TableStatus.OCCUPIED });
      const item = makeItem();

      tableService.findById.mockResolvedValue(table);
      itemsService.findByIds.mockResolvedValue([item as any]);
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(Object.assign(data ?? _entity, { id: 2 })),
      );

      await service.createOrder({
        tableId: 'table-uuid-1',
        items: [{ itemId: 1, quantity: 1 }],
      });

      // Table was already occupied → save for table should NOT be called
      // (only Order save call, not Table)
      const tableSaveCalls = mockManager.save.mock.calls.filter(
        (call) => call[0] !== Order,
      );
      expect(tableSaveCalls.length).toBe(0);
    });

    it('should throw BadRequestException if the table is closed', async () => {
      const table = makeTable({ status: TableStatus.CLOSED });
      tableService.findById.mockResolvedValue(table);

      await expect(
        service.createOrder({
          tableId: 'table-uuid-1',
          items: [{ itemId: 1, quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ──────────────────────────────────────────────────────────
  //  trackOrder
  // ──────────────────────────────────────────────────────────

  describe('trackOrder', () => {
    it('should return order by tracking code', async () => {
      const order = makeOrder();
      orderRepo.findByTrackingCode.mockResolvedValue(order);

      const result = await service.trackOrder('tracking-uuid-1');
      expect(result).toBe(order);
    });

    it('should throw NotFoundException for invalid tracking code', async () => {
      orderRepo.findByTrackingCode.mockResolvedValue(null);

      await expect(service.trackOrder('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  //  updateStatus — State Machine
  // ──────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('should allow valid transition NEW → PREPARING', async () => {
      const order = makeOrder({ status: OrderStatus.NEW });
      orderRepo.findById.mockResolvedValue(order);
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(data ?? _entity),
      );

      const result = await service.updateStatus(1, {
        status: OrderStatus.PREPARING,
      });

      expect(result.status).toBe(OrderStatus.PREPARING);
    });

    it('should allow valid transition PREPARING → SERVED', async () => {
      const order = makeOrder({ status: OrderStatus.PREPARING });
      orderRepo.findById.mockResolvedValue(order);
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(data ?? _entity),
      );

      const result = await service.updateStatus(1, {
        status: OrderStatus.SERVED,
      });

      expect(result.status).toBe(OrderStatus.SERVED);
    });

    it('should allow SERVED → PAID and set paidAt + paymentMethod', async () => {
      const order = makeOrder({ status: OrderStatus.SERVED });
      const table = makeTable({ status: TableStatus.OCCUPIED });

      orderRepo.findById.mockResolvedValue(order);
      mockManager.count.mockResolvedValue(0);
      mockManager.findOne.mockResolvedValue(table);
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(data ?? _entity),
      );

      const result = await service.updateStatus(1, {
        status: OrderStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
      });

      expect(result.status).toBe(OrderStatus.PAID);
      expect(result.paymentMethod).toBe(PaymentMethod.CASH);
      expect(result.paidAt).toBeInstanceOf(Date);
    });

    it('should reject PAID without paymentMethod', async () => {
      const order = makeOrder({ status: OrderStatus.SERVED });
      orderRepo.findById.mockResolvedValue(order);

      await expect(
        service.updateStatus(1, { status: OrderStatus.PAID }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition SERVED → NEW', async () => {
      const order = makeOrder({ status: OrderStatus.SERVED });
      orderRepo.findById.mockResolvedValue(order);

      await expect(
        service.updateStatus(1, { status: OrderStatus.NEW }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.updateStatus(1, { status: OrderStatus.NEW }),
      ).rejects.toThrow('Cannot transition');
    });

    it('should reject any transition from PAID (terminal state)', async () => {
      const order = makeOrder({ status: OrderStatus.PAID });
      orderRepo.findById.mockResolvedValue(order);

      await expect(
        service.updateStatus(1, { status: OrderStatus.PREPARING }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject any transition from CANCEL (terminal state)', async () => {
      const order = makeOrder({ status: OrderStatus.CANCEL });
      orderRepo.findById.mockResolvedValue(order);

      await expect(
        service.updateStatus(1, { status: OrderStatus.NEW }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should save cancel reason when cancelling', async () => {
      const order = makeOrder({ status: OrderStatus.NEW });
      orderRepo.findById.mockResolvedValue(order);
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(data ?? _entity),
      );

      const result = await service.updateStatus(1, {
        status: OrderStatus.CANCEL,
        cancelReason: 'Customer left',
      });

      expect(result.status).toBe(OrderStatus.CANCEL);
      expect(result.cancelReason).toBe('Customer left');
    });

    it('should emit order:status-changed to room and broadcast', async () => {
      const order = makeOrder({ status: OrderStatus.NEW });
      orderRepo.findById.mockResolvedValue(order);
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(data ?? _entity),
      );

      await service.updateStatus(1, { status: OrderStatus.PREPARING });

      expect(realtimeService.emitToRoom).toHaveBeenCalledWith(
        `order:track:${order.trackingCode}`,
        'order:status-changed',
        expect.objectContaining({ orderId: 1, status: OrderStatus.PREPARING }),
      );
      expect(realtimeService.emit).toHaveBeenCalledWith(
        'order:status-changed',
        expect.objectContaining({ orderId: 1 }),
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  //  Table availability toggling
  // ──────────────────────────────────────────────────────────

  describe('table availability', () => {
    it('should free table when last order is paid', async () => {
      const order = makeOrder({ status: OrderStatus.SERVED });
      const table = makeTable({ status: TableStatus.OCCUPIED });

      orderRepo.findById.mockResolvedValue(order);
      mockManager.count.mockResolvedValue(0);
      mockManager.findOne.mockResolvedValue(table);
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(data ?? _entity),
      );

      await service.updateStatus(1, {
        status: OrderStatus.PAID,
        paymentMethod: PaymentMethod.TRANSFER,
      });

      // Table should be freed
      expect(table.status).toBe(TableStatus.AVAILABLE);
    });

    it('should NOT free table when other active orders remain', async () => {
      const order = makeOrder({ status: OrderStatus.SERVED });
      const table = makeTable({ status: TableStatus.OCCUPIED });

      orderRepo.findById.mockResolvedValue(order);
      // There is still 1 other active order
      mockManager.count.mockResolvedValue(1);
      mockManager.findOne.mockResolvedValue(table);
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(data ?? _entity),
      );

      await service.updateStatus(1, {
        status: OrderStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
      });

      // Table should NOT be freed (stays occupied)
      expect(table.status).toBe(TableStatus.OCCUPIED);
    });
  });

  // ──────────────────────────────────────────────────────────
  //  checkoutTable
  // ──────────────────────────────────────────────────────────

  describe('checkoutTable', () => {
    it('should bulk pay all active orders and free table', async () => {
      const table = makeTable({ status: TableStatus.OCCUPIED });
      const orders = [
        makeOrder({ id: 1, status: OrderStatus.NEW, trackingCode: 'tc-1' }),
        makeOrder({ id: 2, status: OrderStatus.SERVED, trackingCode: 'tc-2' }),
      ];

      tableService.findById.mockResolvedValue(table);
      orderRepo.findActiveOrdersByTableId.mockResolvedValue(orders);
      mockManager.findOne.mockResolvedValue(table);
      mockManager.count.mockResolvedValue(0);
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(data ?? _entity),
      );

      const result = await service.checkoutTable('table-uuid-1', {
        paymentMethod: PaymentMethod.CASH,
      });

      // All orders should be PAID
      for (const order of result) {
        expect(order.status).toBe(OrderStatus.PAID);
        expect(order.paymentMethod).toBe(PaymentMethod.CASH);
        expect(order.paidAt).toBeInstanceOf(Date);
      }

      // Table should be freed
      expect(table.status).toBe(TableStatus.AVAILABLE);

      // Events emitted for each order
      expect(realtimeService.emit).toHaveBeenCalledTimes(2);
      expect(realtimeService.emitToRoom).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException when no active orders exist', async () => {
      const table = makeTable();
      tableService.findById.mockResolvedValue(table);
      orderRepo.findActiveOrdersByTableId.mockResolvedValue([]);

      await expect(
        service.checkoutTable('table-uuid-1', {
          paymentMethod: PaymentMethod.CASH,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ──────────────────────────────────────────────────────────
  //  checkoutOrders
  // ──────────────────────────────────────────────────────────

  describe('checkoutOrders', () => {
    it('should check out specific orders and free the table if no active orders remain', async () => {
      const table = makeTable({ status: TableStatus.OCCUPIED });
      const orders = [
        makeOrder({ id: 1, status: OrderStatus.NEW, trackingCode: 'tc-1' }),
        makeOrder({ id: 2, status: OrderStatus.SERVED, trackingCode: 'tc-2' }),
      ];

      tableService.findById.mockResolvedValue(table);
      orderRepo.findWithOptions.mockResolvedValue(orders);
      mockManager.findOne.mockResolvedValue(table);
      mockManager.count.mockResolvedValue(0); // no active orders left
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(data ?? _entity),
      );

      const result = await service.checkoutOrders({
        tableId: 'table-uuid-1',
        orderIds: [1, 2],
        paymentMethod: PaymentMethod.CASH,
      });

      expect(result).toHaveLength(2);
      for (const order of result) {
        expect(order.status).toBe(OrderStatus.PAID);
        expect(order.paymentMethod).toBe(PaymentMethod.CASH);
        expect(order.paidAt).toBeInstanceOf(Date);
      }

      expect(table.status).toBe(TableStatus.AVAILABLE);

      expect(realtimeService.emit).toHaveBeenCalledTimes(2);
      expect(realtimeService.emitToRoom).toHaveBeenCalledTimes(2);
    });

    it('should check out specific orders and NOT free the table if other active orders remain', async () => {
      const table = makeTable({ status: TableStatus.OCCUPIED });
      const ordersToPay = [
        makeOrder({ id: 1, status: OrderStatus.NEW, trackingCode: 'tc-1' }),
      ];

      tableService.findById.mockResolvedValue(table);
      orderRepo.findWithOptions.mockResolvedValue(ordersToPay);
      mockManager.findOne.mockResolvedValue(table);
      mockManager.count.mockResolvedValue(1); // 1 active order remains
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(data ?? _entity),
      );

      const result = await service.checkoutOrders({
        tableId: 'table-uuid-1',
        orderIds: [1],
        paymentMethod: PaymentMethod.TRANSFER,
      });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(OrderStatus.PAID);
      expect(result[0].paymentMethod).toBe(PaymentMethod.TRANSFER);
      expect(table.status).toBe(TableStatus.OCCUPIED); // stays occupied
    });

    it('should throw NotFoundException if one or more orders are not found', async () => {
      const table = makeTable({ status: TableStatus.OCCUPIED });
      tableService.findById.mockResolvedValue(table);
      orderRepo.findWithOptions.mockResolvedValue([
        makeOrder({ id: 1 }),
      ]); // only returned 1 order instead of 2

      await expect(
        service.checkoutOrders({
          tableId: 'table-uuid-1',
          orderIds: [1, 2],
          paymentMethod: PaymentMethod.CASH,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if one or more orders belong to a different table', async () => {
      const table = makeTable({ status: TableStatus.OCCUPIED });
      tableService.findById.mockResolvedValue(table);
      orderRepo.findWithOptions.mockResolvedValue([
        makeOrder({ id: 1, tableId: 'table-uuid-1' }),
        makeOrder({ id: 2, tableId: 'other-table-uuid' }),
      ]);

      await expect(
        service.checkoutOrders({
          tableId: 'table-uuid-1',
          orderIds: [1, 2],
          paymentMethod: PaymentMethod.CASH,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if one or more orders are already paid or cancelled', async () => {
      const table = makeTable({ status: TableStatus.OCCUPIED });
      tableService.findById.mockResolvedValue(table);
      orderRepo.findWithOptions.mockResolvedValue([
        makeOrder({ id: 1, status: OrderStatus.PAID }),
      ]);

      await expect(
        service.checkoutOrders({
          tableId: 'table-uuid-1',
          orderIds: [1],
          paymentMethod: PaymentMethod.CASH,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ──────────────────────────────────────────────────────────
  //  findAll & findById
  // ──────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const orders = [makeOrder()];
      orderRepo.findPaginated.mockResolvedValue([orders, 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.items).toEqual(orders);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should forward search and dateFilter parameters to orderRepository', async () => {
      const orders = [makeOrder()];
      orderRepo.findPaginated.mockResolvedValue([orders, 1]);

      const query = { page: 1, limit: 20, search: 'OD123', dateFilter: 'today' as const };
      await service.findAll(query);

      expect(orderRepo.findPaginated).toHaveBeenCalledWith(query);
    });
  });


  describe('findById', () => {
    it('should return the order', async () => {
      const order = makeOrder();
      orderRepo.findById.mockResolvedValue(order);

      const result = await service.findById(1);
      expect(result).toBe(order);
    });

    it('should throw NotFoundException when order not found', async () => {
      orderRepo.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────────────────
  //  handleVnpayIpn
  // ──────────────────────────────────────────────────────────

  describe('handleVnpayIpn', () => {
    it('should process successful payment, free table, and emit events', async () => {
      const order = makeOrder({ id: 100, status: OrderStatus.SERVED, totalAmount: 50000 });
      const table = makeTable({ status: TableStatus.OCCUPIED });

      orderRepo.findById.mockResolvedValue(order);
      mockManager.findOne.mockResolvedValue(table);
      mockManager.count.mockResolvedValue(0); // table is free after this
      mockManager.save.mockImplementation((_entity, data) =>
        Promise.resolve(data ?? _entity),
      );

      const query = {
        vnp_TxnRef: '100',
        vnp_Amount: '5000000', // 50000 * 100
        vnp_ResponseCode: '00',
        vnp_TransactionStatus: '00',
      };

      const result = await service.handleVnpayIpn(query);

      expect(result).toEqual({ RspCode: '00', Message: 'Success' });
      expect(order.status).toBe(OrderStatus.PAID);
      expect(order.paymentMethod).toBe(PaymentMethod.TRANSFER);
      expect(table.status).toBe(TableStatus.AVAILABLE);

      expect(realtimeService.emitToRoom).toHaveBeenCalledWith(
        `order:track:${order.trackingCode}`,
        'order:status-changed',
        expect.objectContaining({ orderId: 100, status: OrderStatus.PAID }),
      );
      expect(realtimeService.emit).toHaveBeenCalledWith(
        'order:status-changed',
        expect.objectContaining({ orderId: 100 }),
      );
      expect(realtimeService.emit).toHaveBeenCalledWith(
        'table:status-changed',
        expect.objectContaining({ tableId: table.id, status: TableStatus.AVAILABLE }),
      );
    });

    it('should reject invalid amount', async () => {
      const order = makeOrder({ id: 100, status: OrderStatus.SERVED, totalAmount: 50000 });
      orderRepo.findById.mockResolvedValue(order);

      const query = {
        vnp_TxnRef: '100',
        vnp_Amount: '4000000', // wrong amount
        vnp_ResponseCode: '00',
        vnp_TransactionStatus: '00',
      };

      const result = await service.handleVnpayIpn(query);
      expect(result.RspCode).toBe('00');
      expect(result.Message).toBe('Invalid amount');
    });

    it('should reject non-served status', async () => {
      const order = makeOrder({ id: 100, status: OrderStatus.PREPARING, totalAmount: 50000 });
      orderRepo.findById.mockResolvedValue(order);

      const query = {
        vnp_TxnRef: '100',
        vnp_Amount: '5000000',
        vnp_ResponseCode: '00',
        vnp_TransactionStatus: '00',
      };

      const result = await service.handleVnpayIpn(query);
      expect(result.RspCode).toBe('00');
      expect(result.Message).toBe('Order status invalid');
    });
  });
});
