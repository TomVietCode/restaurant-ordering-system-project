import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '@config/configuration.js';
import { AuthModule } from '@modules/auth/auth.module.js';
import { UsersModule } from '@modules/users/users.module.js';
import { CategoriesModule } from '@modules/categories/categories.module.js';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard.js';
import { RolesGuard } from '@common/guards/roles.guard.js';
import { TableModule } from './modules/tables/table.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ItemsModule } from '@modules/items/item.module.js';
import { RealtimeModule } from '@modules/realtime/realtime.module.js';
import { OrdersModule } from '@modules/orders/orders.module.js';
import { MailModule } from '@modules/mail/mail.module.js';
import { ReportsModule } from '@modules/reports/reports.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.ssl'),
        ...((configService.get('database.ssl')) && { ssl: { rejectUnauthorized: false } })
      }),
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    TableModule,
    UploadsModule,
    ItemsModule,
    RealtimeModule,
    OrdersModule,
    MailModule,
    ReportsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
