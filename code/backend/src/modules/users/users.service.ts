import { Injectable, Inject, InjectionToken } from '@nestjs/common';
import { User } from './entities/user.entity.js';
import type { IUserRepository } from './repositories/user.repository.interface.js';

/**
 * Dependency injection token for UserRepository.
 * Allows swapping implementations (e.g., mock in tests) without changing service code.
 */
export const USER_REPOSITORY_TOKEN: InjectionToken<IUserRepository> 
  = Symbol('IUserRepository');

//Service layer for user-related operations.
@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
