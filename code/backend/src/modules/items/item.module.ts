import { Module, forwardRef } from '@nestjs/common';
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
    TypeOrmModule.forFeature([Item]), CategoriesModule
    // forwardRef(() => ),
  ],
  controllers: [ItemsAdminController, ItemsCustomerController],
  providers: [
    {
      provide: ITEM_REPOSITORY_TOKEN,
      useClass: ItemRepository,
    },
    ItemsService,
  ],
  exports: [ItemsService, ITEM_REPOSITORY_TOKEN], // export repository token for other modules
})
export class ItemsModule {}
