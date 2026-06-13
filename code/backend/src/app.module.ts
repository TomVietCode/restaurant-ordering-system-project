import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config';
import { FoodModule } from './modules/food/food.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), FoodModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
