import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { In } from 'typeorm';
import { CategoriesService } from '@modules/categories/categories.service';
import { PaginationDto } from '@common/dtos/pagination.dto.js';
import type { IItemRepository, ItemQueryOptions } from '@modules/items/repositories/item.repo.interface.js';
import { CreateItemDto, ToggleAvailabilityDto, UpdateItemDto } from '@modules/items/dtos.js';
import { Item } from '@modules/items/entities/item.entity.js';
import type { IRealtimeService } from '@modules/realtime/realtime.service.interface.js';
import { ITEM_REPOSITORY_TOKEN, REALTIME_SERVICE_TOKEN } from '@common/constants';
import { ErrorCode } from '@common/error-codes.js';

@Injectable()
export class ItemsService {
  constructor(
    @Inject(ITEM_REPOSITORY_TOKEN)
    private readonly itemRepository: IItemRepository,

    private readonly categoriesService: CategoriesService,

    @Inject(REALTIME_SERVICE_TOKEN)
    private readonly realtimeService: IRealtimeService,
  ) {}
  async create(dto: CreateItemDto): Promise<Item> {
    await this.categoriesService.findById(dto.categoryId);

    const { name, price, categoryId, description, imagesUrl, isRemain } = dto;

    const item = new Item();
    item.name = name;
    item.price = price;
    item.categoryId = categoryId;
    item.description = description ?? null;
    item.imagesUrl = imagesUrl ?? null;
    item.isRemain = isRemain ?? true;

    return this.itemRepository.save(item);
  }

  async findAll(query: ItemQueryOptions): Promise<PaginationDto<Item>> {
    const [items, total] = await this.itemRepository.findPaginated(query);

    const pagination = new PaginationDto<Item>();
    pagination.items = items;
    pagination.page = query.page;
    pagination.limit = query.limit;
    pagination.total = total;
    pagination.totalPages = Math.ceil(total / query.limit);

    return pagination;
  }

  async findById(id: number): Promise<Item> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new NotFoundException({
        message: 'Item not found',
        errorCode: ErrorCode.ITEM_NOT_FOUND,
      });
    }
    return item;
  }

  async findByIds(ids: number[]): Promise<Item[]> {
    if (ids.length === 0) return [];
    return this.itemRepository.findWithOptions({
      where: {
        id: In(ids),
      },
    });
  }

  async update(id: number, dto: UpdateItemDto): Promise<Item> {
    const item = await this.findById(id);
    const { name, price, categoryId, description, imagesUrl, isRemain } = dto
    // If category is being changed, validate the new one exists
    if (categoryId !== undefined && categoryId !== item.categoryId) {
       const category = await this.categoriesService.findById(categoryId);
       item.categoryId = category.id; 
    }

    if (name !== undefined) item.name = name;
    if (price !== undefined) item.price = price;
    if (description !== undefined) item.description = description ?? null;
    if (imagesUrl !== undefined) item.imagesUrl = imagesUrl ?? null;
    if (isRemain !== undefined) item.isRemain = isRemain;

    return this.itemRepository.save(item);
  }


  async toggleAvailability(id: number, dto: ToggleAvailabilityDto): Promise<Item> {
    const item = await this.findById(id);
    item.isRemain = dto.isRemain;
    const saved = await this.itemRepository.save(item);

    this.realtimeService.emit('menu:item-availability-changed', {
      itemId: saved.id,
      isRemain: saved.isRemain,
    });

    return saved;
  }

  /**
   * Soft-delete an item. The row stays in the database (for historical
   * order references) but is excluded from all normal queries.
   */
  async remove(id: number): Promise<void> {
    await this.findById(id); 
    await this.itemRepository.softDelete(id);
  }
}
