import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@common/repositories/base.repository.js';
import { Category } from '../entities/category.entity.js';
import { ICategoryRepository } from './category.repository.interface.js';

@Injectable()
export class CategoryRepository 
  extends BaseRepository<Category> 
  implements ICategoryRepository {
  
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {
    super(categoryRepo);

  }

  // Thêm hàm riêng cho Category
  async savePartial(dto: Partial<Category>): Promise<Category> {
    return await this.categoryRepo.save(dto);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.categoryRepo.count({ where: { name } });
    return count > 0;
  }
}
