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

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    TypeOrmModule.forFeature([RefreshToken]),
    forwardRef(() => UsersModule),
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
  ],
  exports: [AuthService],
})
export class AuthModule {}
