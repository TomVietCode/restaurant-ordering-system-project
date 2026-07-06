import { BadRequestException, forwardRef, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UsersService } from '@modules/users/users.service.js';
import { MailService } from '@modules/mail/mail.service.js';
import type { IRefreshTokenRepository } from './repositories/refresh-token.repository.interface.js';
import type { IResetPasswordTokenRepository } from './repositories/reset-password-token.repository.interface.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { IJwtPayload } from './interfaces/jwt-payload.interface.js';
import { ITokens } from './interfaces/tokens.interface.js';
import { LoginDto } from './dto/login.dto.js';
import { OldPasswordDto, NewPasswordAndOtpDto, EmailDto } from './dto/reset-password.dtos.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UserResponseDto } from '@modules/users/dtos/user-dtos.js';
import { User } from '@modules/users/entities/user.entity.js';
import { ResetPasswordToken } from './entities/reset-password-token.entity.js';
import { InjectionToken } from '@nestjs/common';
import { parseDurationToSeconds } from '@common/helpers/date.js';
import { RESET_PASSWORD_TOKEN_REPOSITORY_TOKEN } from '@common/constants.js';
import { generateOtp } from '@common/helpers/generate.js';

export const REFRESH_TOKEN_REPOSITORY_TOKEN: InjectionToken<IRefreshTokenRepository> = Symbol('IRefreshTokenRepository');

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
    @Inject(RESET_PASSWORD_TOKEN_REPOSITORY_TOKEN)
    private readonly resetPasswordTokenRepository: IResetPasswordTokenRepository,
  ) {}

  async login(dto: LoginDto): Promise<ITokens> {
    const user = await this.validateUser(dto.email, dto.password);
    return this.generateAndPersistTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<ITokens> {
    const payload = this.verifyRefreshToken(refreshToken);

    const storedToken = await this.refreshTokenRepository.findByUserId(payload.sub);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expiredAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const isTokenValid = await bcrypt.compare(refreshToken, storedToken.tokenHash);
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is no longer active');
    }

    return this.generateAndPersistTokens(user);
  }

  /**
   * Revoke the refresh token for a user (logout).
   * Sets revoked_at timestamp so the token can no longer be used.
   */
  async logout(userId: number): Promise<void> {
    await this.refreshTokenRepository.revokeByUserId(userId);
    this.logger.log(`User ${userId} logged out, refresh token revoked`);
  }

  /**
   * Validate user credentials against the database.
   *
   * @returns The authenticated User entity
   * @throws UnauthorizedException — generic message
   */
  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    // User not found
    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    // Account deactivated
    if (!user.isActive) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    return user;
  }

  private async generateAndPersistTokens(user: User): Promise<ITokens> {
    const payload: IJwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const accessExpiration = this.configService.get<string>('jwt.accessExpiration');
    const refreshExpiration = this.configService.get<string>('jwt.refreshExpiration');

    // Sign access token
    const accessToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: accessExpiration as any,
      },
    );

    // Sign refresh token
    const refreshToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: refreshExpiration as any,
      },
    );

    // Hash the refresh token before storing in DB
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    // Calculate expiry date for DB record
    const expiredAt = this.calculateExpiryDate(String(refreshExpiration));

    // Build entity and upsert
    const tokenEntity = new RefreshToken();
    tokenEntity.id = randomUUID();
    tokenEntity.userId = user.id;
    tokenEntity.tokenHash = tokenHash;
    tokenEntity.expiredAt = expiredAt;
    tokenEntity.revokedAt = null;

    await this.refreshTokenRepository.upsertForUser(tokenEntity);

    return { accessToken, refreshToken };
  }

  /**
   * Verify a refresh token's JWT signature and return the decoded payload.
   *
   * @throws UnauthorizedException if signature is invalid or token is expired
   */
  private verifyRefreshToken(refreshToken: string): IJwtPayload {
    try {
      return this.jwtService.verify<IJwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Parse a duration string into a future Date.
   * Used to calculate the expiredAt timestamp for DB storage.
   */
  private calculateExpiryDate(duration: string): Date {
    const seconds = parseDurationToSeconds(duration);
    return new Date(Date.now() + seconds * 1000);
  }

  /**
   * ============================================
   *  CHANGE PASSWORD
   * - verify old password
   * - verify OTP and update password
   * ============================================
   */

  async createAndSendOtp(email: string): Promise<void> {
    await this.resetPasswordTokenRepository.deleteByEmail(email);

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Email had not link to any user');
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
    const user = await this.usersService.findById(currentId);
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
    const user = await this.usersService.findByEmail(token.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.updatePassword(user, newPassword);
    await this.logout(user.id);
    await this.resetPasswordTokenRepository.delete(token.id);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<UserResponseDto> {
    return this.usersService.update(userId, dto);
  }
}
