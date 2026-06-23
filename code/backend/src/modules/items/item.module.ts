import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity.js';
import { CategoriesModule } from '@modules/categories/categories.module.js';
import { ItemsAdminController } from '@modules/items/item-admin.controller.js';
import { ItemsCustomerController } from '@modules/items/item-customer.controller.js';
import { ITEM_REPOSITORY_TOKEN } from '@common/constants.js';
import { ItemRepository } from '@modules/items/repositories/item.repo.js';
import { ItemsService } from '@modules/items/item.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    CategoriesModule,
  ],
  controllers: [ItemsAdminController, ItemsCustomerController],
  providers: [
    {
      provide: ITEM_REPOSITORY_TOKEN,
      useClass: ItemRepository,
    },
    ItemsService,
  ],
  exports: [ItemsService], // export for future use by orders module
})
export class ItemsModule {}
