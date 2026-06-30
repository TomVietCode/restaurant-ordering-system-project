import { Injectable, Inject, InjectionToken, NotFoundException, ConflictException, BadRequestException, forwardRef } from '@nestjs/common';
import { User } from './entities/user.entity.js';
import type { IUserRepository } from './repositories/user.repository.interface.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserQueryDto } from './dtos/user-dtos.js';
// import { AuthService } from '@modules/auth/auth.service.js';
import * as bcrypt from 'bcryptjs';
import { PaginationDto } from '@common/dtos/pagination.dto.js';

/**
 * Dependency injection token for UserRepository.
 * Allows swapping implementations (e.g., mock in tests) without changing service code.
 */
export const USER_REPOSITORY_TOKEN: InjectionToken<IUserRepository> = Symbol('IUserRepository');

//Service layer for user-related operations.
@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    // @Inject(forwardRef(() => AuthService))
    // private readonly authService: AuthService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = Object.assign(new User(), dto);

    if (await this.findByEmail(dto.email)) {
      throw new ConflictException(`Email already exists`);
    }

    if (dto.phone && (await this.userRepository.findByPhone(dto.phone))) {
      throw new ConflictException(`Phone already exists`);
    }

    user.passwordHash = await bcrypt.hash(dto.password, 10);

    const createdUser = await this.userRepository.save(user);
    const { passwordHash, ...userResponse } = createdUser;
    return userResponse as UserResponseDto;
  }

  async findAll(query: UserQueryDto): Promise<PaginationDto<UserResponseDto>> {
    const [users, total] = await this.userRepository.findPaginated(query);

    const pagination = new PaginationDto<UserResponseDto>();
    pagination.items = users.map(({ passwordHash, ...rest }) => rest as UserResponseDto);
    pagination.page = query.page;
    pagination.limit = query.limit;
    pagination.total = total;
    pagination.totalPages = Math.ceil(total / query.limit);

    return pagination;
  }

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
    await this.userRepository.save(user);

    const { passwordHash, ...userResponse } = await this.findById(id);
    return userResponse as UserResponseDto;
  }

  async toggleActivate(id: number, isActive: boolean, currentId: number): Promise<void> {
    const user = await this.findById(id);
    if (isActive === false) {
      if (user.id === currentId) {
        throw new BadRequestException('Owner cant inactive yourself');
      }
      // await this.authService.logout(user.id);
    }
    user.isActive = isActive;
    await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    if (user.isActive === true) {
      throw new BadRequestException(`Can not delete use still active`);
    }
    await this.userRepository.delete(id);
  }

  async updatePassword(user: User, newPassword: string): Promise<void> {
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      throw new BadRequestException('New password and old password can not be the same');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }
}
