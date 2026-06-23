import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableRepository } from './repositories/table.repository';
import { Table } from './table.entity';
import { TableController } from './table.controller';
import { ORDER_CHECK_SERVICE_TOKEN, TABLE_REPO_TOKEN } from '@common/constants';
import { TableService } from './table.service';
import { OrdersModule } from '@modules/orders/orders.module.js';
import { OrderCheckService } from '@modules/orders/order-check.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Table]),
    // forwardRef breaks the circular dependency with OrdersModule
    forwardRef(() => OrdersModule),
  ],
  controllers: [TableController],
  providers: [
    {
      provide: TABLE_REPO_TOKEN,
      useClass: TableRepository,
    },
    {
      // Real implementation replaces the previous OrderCheckStub
      provide: ORDER_CHECK_SERVICE_TOKEN,
      useExisting: OrderCheckService,
    },
    TableService,
  ],
  exports: [TableService],
})
export class TableModule {}
