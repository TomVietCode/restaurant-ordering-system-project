import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@modules/users/users.module.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { RefreshTokenRepository } from './repositories/refresh-token.repository.js';
import { AuthService, REFRESH_TOKEN_REPOSITORY_TOKEN } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { ConfigModule } from '@nestjs/config/dist/index.js';
import { ResetPasswordToken } from './entities/reset-password-token.entity.js';
import { RESET_PASSWORD_TOKEN_REPOSITORY_TOKEN } from '@common/constants.js';
import { ResetPasswordTokenRepository } from './repositories/reset-password-token.repository.js';
import { MailModule } from '@modules/mail/mail.module.js';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    TypeOrmModule.forFeature([RefreshToken, ResetPasswordToken]),
    forwardRef(() => UsersModule),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Bind IRefreshTokenRepository interface to concrete implementation
    {
      provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
      useClass: RefreshTokenRepository,
    },
    {
      provide: RESET_PASSWORD_TOKEN_REPOSITORY_TOKEN,
      useClass: ResetPasswordTokenRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
