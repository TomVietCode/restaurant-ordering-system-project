import { BaseRepository } from '@common/repositories/base.repository';
import { Table } from '@modules/tables/table.entity';
import { ITableRepository } from './table.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TableRepository extends BaseRepository<Table> implements ITableRepository {
  constructor(@InjectRepository(Table) private readonly tableRepo: Repository<Table>) {
    super(tableRepo);
  }

  async findByName(name: string): Promise<Table | null> {
    return this.tableRepo.findOne({ where: { name } });
  }
}
