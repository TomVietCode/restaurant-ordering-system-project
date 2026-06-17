import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UserRepository } from './repositories/user.repository.js';
import { UsersService, USER_REPOSITORY_TOKEN } from './users.service.js';


@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    // Bind the token to the concrete UserRepository
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    UsersService,
  ],
  exports: [UsersService],
})

export class UsersModule {}
