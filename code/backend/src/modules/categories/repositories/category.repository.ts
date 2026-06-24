import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@common/repositories/base.repository.js';
import { Category } from '../entities/category.entity.js';
import { ICategoryRepository } from './category.repository.interface.js';

@Injectable()
export class CategoryRepository extends BaseRepository<Category> implements ICategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {
    super(categoryRepo);
  }

  async findByName(name: string): Promise<Category | null> {
    return await this.categoryRepo.findOne({ where: { name } });
  }
}
