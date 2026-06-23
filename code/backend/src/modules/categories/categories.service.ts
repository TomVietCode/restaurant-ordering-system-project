import { Injectable, Inject, InjectionToken, ConflictException, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity.js';
import type { ICategoryRepository } from './repositories/category.repository.interface.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

export const CATEGORY_REPOSITORY_TOKEN: InjectionToken<ICategoryRepository> 
  = Symbol('ICategoryRepository');

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    await this.existsByName(dto.name);
    const category = new Category();
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async findById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category | null> {
    if(dto.name) {
      await this.existsByName(dto.name);
    }
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async delete(id: number): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    // TODO: Implement a check to see if there are any items associated with this category before deletion. If there are, throw an exception or handle it accordingly.
    if(true){
      console.warn('ItemService hasnt been implemented yet, skipping check for associated items');
    }
    await this.categoryRepository.delete(id);
  }

  async existsByName(name: string): Promise<void> {
    if(await this.categoryRepository.findByName(name)) {
      throw new ConflictException('Category name already exists');
    }
  }
}