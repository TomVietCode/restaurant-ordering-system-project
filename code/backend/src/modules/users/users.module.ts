import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UserRepository } from './repositories/user.repository.js';
import { UsersService, USER_REPOSITORY_TOKEN } from './users.service.js';
import { UserController } from './users.controller.js';
import { AuthModule } from '@modules/auth/auth.module.js';


@Module({
  imports: [TypeOrmModule.forFeature([User]), 
  forwardRef(() => AuthModule)
],
  providers: [
    // Bind the token to the concrete UserRepository
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    UsersService,
  ],
  controllers: [UserController],
  exports: [UsersService],
})

export class UsersModule {}
