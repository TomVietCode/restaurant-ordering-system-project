import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@common/repositories/base.repository.js';
import { User } from '@modules/users/entities/user.entity.js';
import { IUserRepository } from './user.repository.interface.js';
import { UserQueryOptions } from '../dto/dtos.js'

/**
 * TypeORM implementation of IUserRepository.
 * Inherits standard CRUD from BaseRepository and adds email-based lookup.
 */
@Injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    // Pass the TypeORM repository to BaseRepository's constructor
    super(userRepository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }
  async findPaginated(options: UserQueryOptions): Promise<[User[], number]> {
    const { page, limit, search, role, isActive, sortBy, sortOrder } = options;

    const qb = this.userRepository.createQueryBuilder('user');

    if (search) {
      qb.andWhere('(user.username LIKE :search OR user.email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    const validSortFields = {
      email: 'user.email',
      fullName: 'user.fullName',
      createdAt: 'user.createdAt',
    };
    const sortField = validSortFields[sortBy ?? 'createdAt'] ?? 'user.createdAt';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(sortField, order)
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }
}
