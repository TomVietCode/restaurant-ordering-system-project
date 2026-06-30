import { Injectable, Inject, InjectionToken, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Category } from './entities/category.entity.js';
import type { ICategoryRepository } from './repositories/category.repository.interface.js';
import  type { IItemRepository } from '@modules/items/repositories/item.repo.interface.js';
import { ITEM_REPOSITORY_TOKEN } from '@common/constants.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

export const CATEGORY_REPOSITORY_TOKEN: InjectionToken<ICategoryRepository> 
  = Symbol('ICategoryRepository');

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(ITEM_REPOSITORY_TOKEN)
    private readonly itemRepository: IItemRepository,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    await this.existsByName(dto.name);
    const category = new Category();
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryRepository.findAll();
    const countMap = await this.itemRepository.countGroupedByCategory();
    for (const category of categories) {
      category.totalItem = countMap.get(category.id) ?? 0;
    }
    return categories;
  }


  async findById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category | null> {
    const category = await this.findById(id);

    if(dto.name && dto.name !== category.name) {
      await this.existsByName(dto.name);
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);

    const items = await this.itemRepository.findWithOptions({ where: { category: { id } } });
    if (items.length > 0) {
      throw new BadRequestException('Cannot delete category because items are linked to it');
    }
    await this.categoryRepository.delete(id);
  }

  async existsByName(name: string): Promise<void> {
    if(await this.categoryRepository.findByName(name)) {
      throw new ConflictException('Category name already exists');
    }
  }
}