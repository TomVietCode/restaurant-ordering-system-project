import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository.js';
import { User } from '../entities/user.entity.js';
import { IUserRepository } from './user.repository.interface.js';

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
}
