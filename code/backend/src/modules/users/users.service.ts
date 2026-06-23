import {
  Injectable,
  Inject,
  InjectionToken,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
import { User } from './entities/user.entity.js';
import { Role } from '@common/enums.js';
import type { IUserRepository } from './repositories/user.repository.interface.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/dtos.js';
import { AuthService } from '@modules/auth/auth.service.js';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly typeOrmRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user || user == null) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = Object.assign(new User(), dto);

    user.passwordHash = await bcrypt.hash(dto.password, 10);

    if (await this.findByEmail(dto.email)) {
      throw new ConflictException(`Email already exists`);
    }

    if (dto.phone && (await this.userRepository.findByPhone(dto.phone))) {
      throw new ConflictException(`Phone already exists`);
    }

    const createdUser = await this.userRepository.save(user);
    const { passwordHash, ...userResponse } = createdUser;
    return userResponse as UserResponseDto;
  }

  async findAll(filters: {
    search?: string;
    role?: Role;
    isActive?: boolean;
    sortBy?: 'createdAt' | 'email' | 'fullName';
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }): Promise<{ data: UserResponseDto[]; total: number }> {
    const { search, role, isActive, sortBy = 'createdAt', order = 'DESC', page = 1, limit = 10 } = filters;
    const query = this.typeOrmRepo.createQueryBuilder('user');

    // search theo username hoặc email
    if (search) {
      query.andWhere('(user.username LIKE :search OR user.email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    // lọc theo role
    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    // lọc theo isActive
    if (isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive });
    }

    // sắp xếp và phân trang
    query
      .orderBy(`user.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    // lấy dữ liệu và tổng số bản ghi
    const [users, total] = await query.getManyAndCount();

    // loại bỏ passwordHash trước khi trả về
    const data = users.map(({ passwordHash, ...rest }) => rest as UserResponseDto);

    return { data, total };
  }

  async update(id: number, dto: UpdateUserDto, userId: number): Promise<UserResponseDto> {
    const user = await this.findById(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    if (dto.isActive === false) {
      if (user.id === userId) {
        throw new BadRequestException('Owner cant inactive yourself');
      }
      await this.authService.logout(user.id);
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

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    if (user.isActive === true) {
      throw new BadRequestException(`Can not delete use still active`);
    }
    await this.userRepository.delete(id);
  }
}
