import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableRepository } from './repositories/table.repository.js';
import { Table } from 'typeorm';
import { TableController } from './table.controller.js';
import { ORDER_CHECK_SERVICE_TOKEN, TABLE_REPO_TOKEN } from '@common/constants.js';
import { OrderCheckStub } from './order-check.stub.js';
import { TableService } from './table.service.js';


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
