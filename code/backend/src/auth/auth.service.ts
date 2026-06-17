import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service.js';
import type { IRefreshTokenRepository } from './repositories/refresh-token.repository.interface.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { IJwtPayload } from './interfaces/jwt-payload.interface.js';
import { ITokens } from './interfaces/tokens.interface.js';
import { LoginDto } from './dto/login.dto.js';
import { User } from '../users/entities/user.entity.js';
import { InjectionToken } from '@nestjs/common';
import { parseDurationToSeconds } from '../common/helpers/date.js';

export const REFRESH_TOKEN_REPOSITORY_TOKEN: InjectionToken<IRefreshTokenRepository> = Symbol('IRefreshTokenRepository');

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
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
}
