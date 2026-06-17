import { IBaseRepository } from '../../common/repositories/base.repository.interface.js';
import { User } from '../entities/user.entity.js';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}
