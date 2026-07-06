import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@common/repositories/base.repository';
import { Item } from '@modules/items/entities/item.entity';
import { IItemRepository, ItemQueryOptions } from '@modules/items/repositories/item.repo.interface';

@Injectable()
export class ItemRepository extends BaseRepository<Item> implements IItemRepository {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {
    super(itemRepo);
  }

  async findByName(name: string): Promise<Item | null> {
    return this.itemRepo.findOne({ where: { name } });
  }

  async findPaginated(options: ItemQueryOptions): Promise<[Item[], number]> {
    const { page, limit, search, categoryId, sortBy, sortOrder } = options;

    const qb = this.itemRepo.createQueryBuilder('item').leftJoinAndSelect('item.category', 'category');

    if (search) {
      qb.andWhere('item.name ILIKE :search', { search: `%${search}%` });
    }

    if (categoryId) {
      qb.andWhere('item.categoryId = :categoryId', { categoryId });
    }

    // Sort: default to createdAt DESC
    const validSortFields = { price: 'item.price', name: 'item.name', createdAt: 'item.createdAt' };
    const sortField = validSortFields[sortBy ?? 'createdAt'] ?? 'item.createdAt';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortField, order);

    qb.skip((page - 1) * limit).take(limit);

    return qb.getManyAndCount();
  }

  async countGroupedByCategory(): Promise<Map<number, number>> {
    const rawCounts = await this.itemRepo
      .createQueryBuilder('item')
      .select('item.categoryId', 'categoryId')
      .addSelect('COUNT(item.id)', 'count')
      .where('item.deletedAt IS NULL')
      .groupBy('item.categoryId')
      .getRawMany();

    const countMap = new Map<number, number>();
    for (const row of rawCounts) {
      if (row.categoryId !== null && row.categoryId !== undefined) {
        countMap.set(Number(row.categoryId), Number(row.count));
      }
    }
    return countMap;
  }
}

