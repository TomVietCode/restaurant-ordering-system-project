import { IBaseRepository } from '@common/repositories/base.repository.interface.js';
import { Item } from '@modules/items/entities/item.entity';

export interface ItemQueryOptions {
  page: number;
  limit: number;
  search?: string;
  categoryId?: number;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface IItemRepository extends IBaseRepository<Item> {
  findByName(name: string): Promise<Item | null>;
  findPaginated(options: ItemQueryOptions): Promise<[Item[], number]>;
}
