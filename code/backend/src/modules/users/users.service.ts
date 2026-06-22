import { Injectable, Inject, InjectionToken, NotFoundException, ConflictException, ForbiddenException, BadRequestException, forwardRef } from '@nestjs/common';
import { User } from './entities/user.entity.js';
import type { IUserRepository } from './repositories/user.repository.interface.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/dtos.js';
import { Role } from '@common/enums.js';
// import { AuthService } from './../auth/auth.service.js';

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

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = Object.assign(new User(), dto);

    if (await this.findByEmail(dto.email)) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    if (dto.phone && (await this.userRepository.findByPhone(dto.phone))) {
      throw new ConflictException(`User with phone ${dto.phone} already exists`);
    }

    const createdUser = await this.userRepository.save(user);
    const userResponse: UserResponseDto = Object.assign(new UserResponseDto(), createdUser);
    return userResponse;
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    const userResponses: UserResponseDto[] = users.map((user) => Object.assign(new UserResponseDto(), user));
    return userResponses;
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    Object.assign(user, dto);

    if (dto.email && dto.email !== user.email) {
      //nếu dto có nhập email mới, khác email cũ thì check trùng email
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already exists');
      }
      user.email = dto.email;
    }

    if (user.role === Role.OWNER && dto.role && dto.role !== Role.OWNER) {
      throw new BadRequestException('Cannot change role of an OWNER user');
    }

    const updatedUser = await this.userRepository.save(user);
    const userResponse: UserResponseDto = Object.assign(new UserResponseDto(), updatedUser);
    return userResponse;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (user.role === Role.OWNER) {
      throw new BadRequestException(`Cannot delete user with OWNER role`);
    }
    if (user.isActive === false) {
      throw new BadRequestException(`User with ID ${id} is already inactive`);
    }
    user.isActive = false;
    await this.userRepository.save(user);

    // this.authService.logout(user.id);
  }
}
