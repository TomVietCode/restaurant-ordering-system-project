import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableRepository } from './repositories/table.repository';
import { Table } from './table.entity';
import { TableController } from './table.controller';
import { ORDER_CHECK_SERVICE_TOKEN, TABLE_REPO_TOKEN } from '@common/constants';
import { OrderCheckStub } from './order-check.stub';
import { TableService } from './table.service';

@Module({
  imports: [TypeOrmModule.forFeature([Table])],
  controllers: [TableController],
  providers: [
    {
      provide: TABLE_REPO_TOKEN,
      useClass: TableRepository,
    },
    {
      // TODO: Replace OrderCheckStub with real OrderCheckService
      // when the Orders module is implemented
      provide: ORDER_CHECK_SERVICE_TOKEN,
      useClass: OrderCheckStub,
    },
    TableService,
  ],
  exports: [TableService],
})
export class TableModule {}
