import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { IBaseRepository } from './base.repository.interface';

export abstract class BaseRepository<T extends { id: number | string }> implements IBaseRepository<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async findById(id: number | string): Promise<T | null> {
    return await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
  }
  async findAll(): Promise<T[]> {
    return await this.repository.find();
  }
  async findWithOptions(options: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }
  async save(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }
  async saveMany(entities: T[]): Promise<T[]> {
    return await this.repository.save(entities);
  }
  async delete(id: number | string): Promise<void> {
    await this.repository.delete(id);
  }
  async exists(id: number | string): Promise<boolean> {
    const count = await this.repository.count({
      where: { id } as FindOptionsWhere<T>,
    });
    return count > 0;
  }
}
