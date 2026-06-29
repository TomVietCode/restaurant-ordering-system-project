import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UserRepository } from './repositories/user.repository.js';
import { UsersService, USER_REPOSITORY_TOKEN, RESET_PASSWORD_TOKEN_REPOSITORY_TOKEN } from './users.service.js';
import { UserController } from './users.controller.js';
// import { AuthModule } from '@modules/auth/auth.module.js';
import { ResetPasswordTokenRepository } from './repositories/reset-password-token.repository.js';
import { ResetPasswordToken } from './entities/reset-password-token.entity.js';
import { MailModule } from '@modules/mail/mail.module.js';


@Module({
  imports: [TypeOrmModule.forFeature([User, ResetPasswordToken]), 
  // forwardRef(() => AuthModule),
  MailModule,
],
  providers: [
    // Bind the token to the concrete UserRepository
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    {
      provide: RESET_PASSWORD_TOKEN_REPOSITORY_TOKEN,
      useClass: ResetPasswordTokenRepository,
    },
    UsersService,
  ],
  controllers: [UserController],
  exports: [UsersService],
})

export class UsersModule {}
