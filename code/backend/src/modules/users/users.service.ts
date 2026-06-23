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
import type { IUserRepository } from './repositories/user.repository.interface.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto, ChangePasswordDto } from './dto/dtos.js';
import { Role } from '@common/enums.js';
// import { AuthService } from '@modules/auth/auth.service.js';
import * as bcrypt from 'bcryptjs';

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

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    const userResponses: UserResponseDto[] = users.map((user) => {
      const { passwordHash, ...rest } = user;
      return rest as UserResponseDto;
    });
    console.log(userResponses)
    return userResponses;
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (dto.email && dto.email !== user.email) {
      //nếu dto có nhập email mới, khác email cũ thì check trùng email
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already exists');
      }
      user.email = dto.email;
    }

    if(dto.password){
      throw new BadRequestException('Cannot update password through this endpoint');
    }

    Object.assign(user, dto);
    const updatedUser = await this.userRepository.save(user);
    const { passwordHash, ...userResponse } = updatedUser;
    return userResponse as UserResponseDto;
  }

  async remove(id: number, userId): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    if (user.id === userId ) {
      throw new BadRequestException(`Owner cant delete yourself`);
    }
    if (user.isActive === false) {
      throw new BadRequestException(`User not active`);
    }
    user.isActive = false;
    await this.userRepository.save(user);

    // this.authService.logout(user.id);
  }

  async changePassword(id: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    if(user.isActive === false){
      throw new BadRequestException(`User not active`);
    }
    if(!(await bcrypt.compare(dto.oldPassword, user.passwordHash))){
      throw new ForbiddenException('Old password is incorrect');
    }
    if(dto.newPassword !== dto.confirmNewPassword){
      throw new BadRequestException('New password and confirm new password do not match');
    }
    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);
  }
}
