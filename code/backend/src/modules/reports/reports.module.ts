import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Order } from '@modules/orders/entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportRepository } from './repositories/report.repository';
import { REPORT_REPOSITORY } from '@common/constants';
import { Item } from '@modules/items/entities/item.entity';
import { OrderItem } from '@modules/orders/entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Item])],
  providers: [
    ReportsService,
    {
      provide: REPORT_REPOSITORY,
      useClass: ReportRepository,
    },
  ],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
