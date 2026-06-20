import { ORDER_CHECK_SERVICE_TOKEN, TABLE_REPO_TOKEN } from '@common/constants';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ITableRepository } from './repositories/table.repository.interface';
import type { IOrderCheckService } from '@common/interfaces/order-check.interface';
import { CreateTableDto, UpdateTableDto } from './repositories/dtos';
import { Table } from './table.entity';

@Injectable()
export class TableService {
  constructor(
    @Inject(TABLE_REPO_TOKEN)
    private readonly tableRepository: ITableRepository,

    @Inject(ORDER_CHECK_SERVICE_TOKEN)
    private readonly orderCheckService: IOrderCheckService,
  ) {}

  async create(dto: CreateTableDto): Promise<Table> {
    // Check for duplicate name before insert
    const existing = await this.tableRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException('Table name already exists');
    }
    const table = new Table();
    table.name = dto.name;
    table.capacity = dto.capacity ?? null;
    return this.tableRepository.save(table);
  }

  async findAll(): Promise<Table[]> {
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
    return this.tableRepository.save(table);
  }

  async remove(id: string): Promise<void> {
    // Verify the table exists first
    await this.findById(id);
    
    // Check if the table has active orders
    const hasActive = await this.orderCheckService.hasActiveOrders(id);
    if (hasActive) {
      throw new BadRequestException(
        'Cannot delete table that has active orders',
      );
    }
    await this.tableRepository.delete(id);
  }
}
