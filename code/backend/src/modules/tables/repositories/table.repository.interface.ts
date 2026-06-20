import { IBaseRepository } from "@common/repositories/base.repository.interface";
import { Table } from "@modules/tables/table.entity";

export interface ITableRepository extends IBaseRepository<Table> {
  findByName(name: string): Promise<Table | null>
} 