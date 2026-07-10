import { ORDER_CHECK_SERVICE_TOKEN, TABLE_REPO_TOKEN, REALTIME_SERVICE_TOKEN } from '@common/constants';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ITableRepository } from './repositories/table.repository.interface';
import type { IOrderCheckService } from '@common/interfaces/order-check.interface';
import type { IRealtimeService } from '@modules/realtime/realtime.service.interface.js';
import { CreateTableDto, UpdateTableDto } from './repositories/dtos';
import { Table } from './table.entity';
import { TableStatus } from '@common/enums.js';
import { ErrorCode } from '@common/error-codes.js';

@Injectable()
export class TableService {
  constructor(
    @Inject(TABLE_REPO_TOKEN)
    private readonly tableRepository: ITableRepository,

    @Inject(ORDER_CHECK_SERVICE_TOKEN)
    private readonly orderCheckService: IOrderCheckService,

    @Inject(REALTIME_SERVICE_TOKEN)
    private readonly realtimeService: IRealtimeService,
  ) {}

  async create(dto: CreateTableDto): Promise<Table> {
    // Check for duplicate name before insert
    const existing = await this.tableRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException({
        message: 'Table name already exists',
        errorCode: ErrorCode.TABLE_NAME_ALREADY_EXISTS,
      });
    }
    const table = new Table();
    table.name = dto.name;
    table.capacity = dto.capacity;
    table.status = dto.status ?? TableStatus.AVAILABLE;
    return this.tableRepository.save(table);
  }

  async findAll(status?: TableStatus): Promise<Table[]> {
    // Newest tables first — this ordering is fixed and does not change.
    return this.tableRepository.findWithOptions({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Table> {
    const table = await this.tableRepository.findById(id);
    if (!table) {
      throw new NotFoundException({
        message: 'Table not found',
        errorCode: ErrorCode.TABLE_NOT_FOUND,
      });
    }
    return table;
  }

  async update(id: string, dto: UpdateTableDto): Promise<Table> {
    const table = await this.findById(id);
    // If name is being changed, check for conflicts
    if (dto.name !== undefined && dto.name !== table.name) {
      const conflict = await this.tableRepository.findByName(dto.name);
      if (conflict) {
        throw new ConflictException({
          message: 'Table name already exists',
          errorCode: ErrorCode.TABLE_NAME_ALREADY_EXISTS,
        });
      }
      table.name = dto.name;
    }

    if (dto.capacity !== undefined) {
      table.capacity = dto.capacity;
    }

    if (dto.status !== undefined) {
      if (dto.status !== table.status) {
        const hasActive = await this.orderCheckService.hasActiveOrders(id);
        if (hasActive) {
          throw new BadRequestException({
            message: 'Cannot change table status while it has active orders',
            errorCode: ErrorCode.TABLE_HAS_ACTIVE_ORDER,
          });
        }
      }
      table.status = dto.status;
    }
    return this.tableRepository.save(table);
  }

  async remove(id: string): Promise<void> {
    // Verify the table exists first
    await this.findById(id);

    // Check if the table has active orders
    const hasActive = await this.orderCheckService.hasActiveOrders(id);
    if (hasActive) {
      throw new BadRequestException({
        message: 'Cannot delete table that has active orders',
        errorCode: ErrorCode.TABLE_HAS_ACTIVE_ORDER,
      });
    }
    await this.tableRepository.delete(id);
  }

  async toggleStatus(id: string): Promise<Table> {
    const table = await this.findById(id);

    if (table.status === TableStatus.OCCUPIED) {
      throw new BadRequestException({
        message: 'Cannot toggle status when table is occupied',
        errorCode: ErrorCode.TABLE_HAS_ACTIVE_ORDER,
      });
    }

    table.status = table.status === TableStatus.AVAILABLE ? TableStatus.CLOSED : TableStatus.AVAILABLE;
    const savedTable = await this.tableRepository.save(table);

    // Emit realtime event to all connected admin/staff clients
    this.realtimeService.emit('table:status-changed', {
      tableId: savedTable.id,
      status: savedTable.status,
    });

    return savedTable;
  }
}

