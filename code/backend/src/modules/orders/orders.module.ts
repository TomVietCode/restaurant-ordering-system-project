import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { OrderRepository } from './repositories/order.repository.js';
import { OrdersService } from './orders.service.js';
import { OrderCheckService } from './order-check.service.js';
import { OrdersController } from './orders.controller.js';
import { PaymentsController } from './payments.controller.js';
import { ORDER_REPO_TOKEN } from '@common/constants.js';
import { TableModule } from '@modules/tables/table.module.js';
import { ItemsModule } from '@modules/items/item.module.js';
import { VnpayModule } from 'nestjs-vnpay';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashAlgorithm } from 'vnpay';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    forwardRef(() => TableModule),
    VnpayModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            tmnCode: configService.getOrThrow<string>('vnpay.tmnCode'),
            secureSecret: configService.getOrThrow<string>('vnpay.secureSecret'),
    
            testMode: true,
    
            hashAlgorithm: HashAlgorithm.SHA512,
    
            enableLog: true,
          }),
        }),
    ItemsModule,
  ],
  controllers: [OrdersController, PaymentsController],
  providers: [
    {
      provide: ORDER_REPO_TOKEN,
      useClass: OrderRepository,
    },
    
    OrdersService,
    OrderCheckService,
  ],
  exports: [OrderCheckService],
})
export class OrdersModule {}
