import { FindManyOptions } from "typeorm"

export interface IBaseRepository<T> {
  findById(id: number | string): Promise<T | null>
  findAll(): Promise<T[]>
  findWithOptions(options: FindManyOptions<T>): Promise<T[]>
  save(entity: T): Promise<T>
  saveMany(entities: T[]): Promise<T[]>
  delete(id: number | string): Promise<void>
  softDelete(id: number | string): Promise<void>
  exists(id: number | string): Promise<boolean>
}