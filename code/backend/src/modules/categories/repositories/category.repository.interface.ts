import { IBaseRepository } from '@common/repositories/base.repository.interface.js';
import { Category } from '../entities/category.entity.js';

export interface ICategoryRepository extends IBaseRepository<Category> {
  savePartial(dto: Partial<Category>): Promise<Category>;
  existsByName(name: string): Promise<boolean>;
}
