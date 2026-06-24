import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { CategoryRepository } from './repositories/category.repository.js';
import { CategoriesService, CATEGORY_REPOSITORY_TOKEN } from './categories.service.js';
import { CategoriesController } from './categories.controller.js';
import { ItemsModule } from '@modules/items/item.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), 
  forwardRef(() => ItemsModule)
],
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
