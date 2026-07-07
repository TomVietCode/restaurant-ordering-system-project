import { Injectable, Inject, InjectionToken, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { User } from './entities/user.entity.js';
import type { IUserRepository } from './repositories/user.repository.interface.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserQueryDto } from './dtos/user-dtos.js';
import * as bcrypt from 'bcryptjs';
import { PaginationDto } from '@common/dtos/pagination.dto.js';

/**
 * Dependency injection token for UserRepository.
 * Allows swapping implementations (e.g., mock in tests) without changing service code.
 */
export const USER_REPOSITORY_TOKEN: InjectionToken<IUserRepository> = Symbol('IUserRepository');

/**
 * Service layer handling user business logic.
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Helper method to map a User entity to a UserResponseDto.
   * This ensures we only return safe public fields and do not expose sensitive fields like passwordHash.
   */
  private mapToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  /**
   * Finds a user by email.
   * Note: This returns the full User entity including the password hash, 
   * which is intended for authentication logic.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Finds a user by ID.
   * Note: This returns the full User entity including the password hash,
   * which is intended for internal service-to-service operations.
   */
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Finds a user and maps it to a safe response DTO.
   * Intended for public/controller use.
   */
  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.findById(id);
    return this.mapToResponseDto(user);
  }

  /**
   * Creates a new user and returns a safe response DTO.
   */
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    if (await this.findByEmail(dto.email)) {
      throw new ConflictException('Email already exists');
    }

    if (dto.phone && (await this.userRepository.findByPhone(dto.phone))) {
      throw new ConflictException('Phone number already exists');
    }

    const user = Object.assign(new User(), dto);
    user.passwordHash = await bcrypt.hash(dto.password, 10);

    const createdUser = await this.userRepository.save(user);
    return this.mapToResponseDto(createdUser);
  }

  /**
   * Retrieves a paginated list of users mapped to safe response DTOs.
   */
  async findAll(query: UserQueryDto): Promise<PaginationDto<UserResponseDto>> {
    const [users, total] = await this.userRepository.findPaginated(query);

    const pagination = new PaginationDto<UserResponseDto>();
    pagination.items = users.map((user) => this.mapToResponseDto(user));
    pagination.page = query.page;
    pagination.limit = query.limit;
    pagination.total = total;
    pagination.totalPages = Math.ceil(total / query.limit);

    return pagination;
  }

  /**
   * Updates user information and returns a safe response DTO.
   */
  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findById(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    if (dto.phone && dto.phone !== user.phone) {
      const existing = await this.userRepository.findByPhone(dto.phone);
      if (existing) {
        throw new ConflictException('Phone number already exists');
      }
    }

    const { password, ...rest } = dto;
    Object.assign(user, rest);

    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }
    
    const updatedUser = await this.userRepository.save(user);
    return this.mapToResponseDto(updatedUser);
  }

  /**
   * Toggles the active status of a user.
   */
  async toggleActivate(id: number, isActive: boolean, currentId: number): Promise<void> {
    const user = await this.findById(id);
    
    if (isActive === false) {
      if (user.id === currentId) {
        throw new BadRequestException('You cannot deactivate your own account');
      }
    }
    
    user.isActive = isActive;
    await this.userRepository.save(user);
  }

  /**
   * Deletes a user by ID.
   */
  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    if (user.isActive === true) {
      throw new BadRequestException('Cannot delete an active user');
    }
    await this.userRepository.delete(id);
  }

  /**
   * Updates user password after validation.
   */
  async updatePassword(user: User, newPassword: string): Promise<void> {
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      throw new BadRequestException('New password and old password cannot be the same');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }
}
