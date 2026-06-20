import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { CategoryRepository } from './repositories/category.repository.js';
import { CategoriesService, CATEGORY_REPOSITORY_TOKEN } from './categories.service.js';
import { CategoriesController } from './categories.controller.js';


@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [
    // Bind the token to the concrete CategoryRepository
    {
      provide: CATEGORY_REPOSITORY_TOKEN,
      useClass: CategoryRepository,
    },
    CategoriesService,
  ],
  exports: [CategoriesService],
})

export class CategoriesModule {}
