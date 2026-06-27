import { ORDER_CHECK_SERVICE_TOKEN, TABLE_REPO_TOKEN, REALTIME_SERVICE_TOKEN } from '@common/constants';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ITableRepository } from './repositories/table.repository.interface';
import type { IOrderCheckService } from '@common/interfaces/order-check.interface';
import type { IRealtimeService } from '@modules/realtime/realtime.service.interface.js';
import { CreateTableDto, UpdateTableDto } from './repositories/dtos';
import { Table } from './table.entity';
import { TableStatus } from '@common/enums.js';

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
      throw new ConflictException('Table name already exists');
    }
    const table = new Table();
    table.name = dto.name;
    table.capacity = dto.capacity;
    table.status = dto.status ?? TableStatus.AVAILABLE;
    return this.tableRepository.save(table);
  }

  async findAll(status?: TableStatus): Promise<Table[]> {
    if (status) {
      return this.tableRepository.findWithOptions({ where: { status } });
    }
    return this.tableRepository.findAll();
  }

  async findById(id: string): Promise<Table> {
    const table = await this.tableRepository.findById(id);
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }

  async update(id: string, dto: UpdateTableDto): Promise<Table> {
    const table = await this.findById(id);
    // If name is being changed, check for conflicts
    if (dto.name !== undefined && dto.name !== table.name) {
      const conflict = await this.tableRepository.findByName(dto.name);
      if (conflict) {
        throw new ConflictException('Table name already exists');
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
          throw new BadRequestException('Cannot change table status while it has active orders');
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
      throw new BadRequestException('Cannot delete table that has active orders');
    }
    await this.tableRepository.delete(id);
  }

  async toggleStatus(id: string): Promise<Table> {
    const table = await this.findById(id);

    if (table.status === TableStatus.OCCUPIED) {
      throw new BadRequestException('Cannot toggle status when table is occupied');
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

