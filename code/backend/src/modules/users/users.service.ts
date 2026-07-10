import { Injectable, Inject, InjectionToken, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { User } from './entities/user.entity.js';
import type { IUserRepository } from './repositories/user.repository.interface.js';
import type { IRefreshTokenRepository } from '@modules/auth/repositories/refresh-token.repository.interface.js';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '@modules/auth/auth.service.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserQueryDto } from './dtos/user-dtos.js';
import * as bcrypt from 'bcryptjs';
import { PaginationDto } from '@common/dtos/pagination.dto.js';
import { ErrorCode } from '@common/error-codes.js';

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

    @Inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
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
      throw new NotFoundException({
        message: 'User not found',
        errorCode: ErrorCode.USER_NOT_FOUND,
      });
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
      throw new ConflictException({
        message: 'Email already exists',
        errorCode: ErrorCode.EMAIL_ALREADY_EXISTS,
      });
    }

    if (dto.phone && (await this.userRepository.findByPhone(dto.phone))) {
      throw new ConflictException({
        message: 'Phone number already exists',
        errorCode: ErrorCode.PHONE_ALREADY_EXISTS,
      });
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
   *
   * @param currentId - id of the authenticated user performing the update.
   *   Used to prevent a user from changing their own role.
   */
  async update(id: number, dto: UpdateUserDto, currentId?: number): Promise<UserResponseDto> {
    const user = await this.findById(id);

    // A role change is requested only when the new role differs from the current one.
    const isRoleChanged = dto.role !== undefined && dto.role !== user.role;

    // Users must not be able to change their own role.
    if (isRoleChanged && currentId !== undefined && user.id === currentId) {
      throw new BadRequestException({
        message: 'You cannot change your own role',
        errorCode: ErrorCode.CANNOT_CHANGE_OWN_ROLE,
      });
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException({
          message: 'Email already exists',
          errorCode: ErrorCode.EMAIL_ALREADY_EXISTS,
        });
      }
    }

    if (dto.phone && dto.phone !== user.phone) {
      const existing = await this.userRepository.findByPhone(dto.phone);
      if (existing) {
        throw new ConflictException({
          message: 'Phone number already exists',
          errorCode: ErrorCode.PHONE_ALREADY_EXISTS,
        });
      }
    }

    const { password, ...rest } = dto;
    Object.assign(user, rest);

    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.userRepository.save(user);

    // When an account's role changes, revoke its active session so the user is
    // forced to log in again (mirrors the behaviour when an account is locked).
    if (isRoleChanged) {
      await this.refreshTokenRepository.revokeByUserId(updatedUser.id);
    }

    return this.mapToResponseDto(updatedUser);
  }

  /**
   * Toggles the active status of a user.
   */
  async toggleActivate(id: number, isActive: boolean, currentId: number): Promise<void> {
    const user = await this.findById(id);
    
    if (isActive === false) {
      if (user.id === currentId) {
        throw new BadRequestException({
          message: 'You cannot deactivate your own account',
          errorCode: ErrorCode.CANNOT_DEACTIVATE_SELF,
        });
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
      throw new BadRequestException({
        message: 'Cannot delete an active user',
        errorCode: ErrorCode.CANNOT_DELETE_ACTIVE_USER,
      });
    }
    await this.userRepository.delete(id);
  }

  /**
   * Updates user password after validation.
   */
  async updatePassword(user: User, newPassword: string): Promise<void> {
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      throw new BadRequestException({
        message: 'New password and old password cannot be the same',
        errorCode: ErrorCode.SAME_PASSWORD,
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }
}
