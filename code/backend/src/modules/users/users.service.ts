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
import type { IResetPasswordTokenRepository } from './repositories/reset-password-token.repository.interface.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UserQueryDto } from './dtos/user-dtos.js';
// import { AuthService } from '@modules/auth/auth.service.js';
import * as bcrypt from 'bcryptjs';
import { PaginationDto } from '@common/dtos/pagination.dto.js';
import { EmailDto, NewPasswordAndOtpDto, OldPasswordDto } from './dtos/reset-password.dtos.js';
import { ResetPasswordToken } from './entities/reset-password-token.entity.js';
import { MailService } from '@modules/mail/mail.service.js';
import { generateOtp } from '@common/helpers/generate.js';

/**
 * Dependency injection token for UserRepository.
 * Allows swapping implementations (e.g., mock in tests) without changing service code.
 */
export const USER_REPOSITORY_TOKEN: InjectionToken<IUserRepository> = Symbol('IUserRepository');
export const RESET_PASSWORD_TOKEN_REPOSITORY_TOKEN: InjectionToken<IResetPasswordTokenRepository> = Symbol('IResetPasswordTokenRepository');

//Service layer for user-related operations.
@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(RESET_PASSWORD_TOKEN_REPOSITORY_TOKEN)
    private readonly resetPasswordTokenRepository: IResetPasswordTokenRepository,
    private readonly mailService: MailService,
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


  /////// CHANGE PASS WORD
  async createAndSendOtp(email: string): Promise<void> {
    await this.resetPasswordTokenRepository.deleteByEmail(email);

    const user = await this.userRepository.findByEmail(email);
    if(!user) {
      throw new NotFoundException("Email had not link to any user");
    }
    const otp = generateOtp();
    
    const token = new ResetPasswordToken();
    token.email = email;
    token.otp = otp;
    token.expiredAt = new Date(Date.now() + 5 * 60 * 1000); // hết hạn sau 5 phút

    await this.resetPasswordTokenRepository.save(token);
    await this.mailService.sendOtp(email, otp);
  }

  async changePasswordRequest(currentId: number, dto: OldPasswordDto): Promise<void> {
    const user = await this.findById(currentId);
    const isValid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Old password invalid');
    }

    await this.createAndSendOtp(user.email);
  }

  async forgetPassword(dto: EmailDto): Promise<void> {
    const { email } = dto;
    await this.createAndSendOtp(email);
  }

  async changePasswordVerify(dto: NewPasswordAndOtpDto): Promise<void> {
    const { newPassword, otp } = dto;

    const token = await this.resetPasswordTokenRepository.findByOtp(otp);
    if (!token) {
      throw new BadRequestException('OTP not corret');
    }
    if (token.expiredAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }
    const user = await this.userRepository.findByEmail(token.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.updatePassword(user, newPassword);
    await this.resetPasswordTokenRepository.delete(token.id);
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
