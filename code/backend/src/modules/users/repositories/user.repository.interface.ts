import { IBaseRepository } from '@common/repositories/base.repository.interface.js';
import { User } from '@modules/users/entities/user.entity.js';
import { UserQueryOptions } from '../dto/dtos.js'

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findPaginated(options: UserQueryOptions): Promise<[User[], number]>
}
