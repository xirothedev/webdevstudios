import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
import { OrdersController } from './orders.controller';
import { OrderRepo } from './repo';
import { OrderService } from './services/orders.service';
import { OrderExpirationScheduler } from './schedulers';

@Module({
  imports: [ScheduleModule, CartModule, ProductsModule],
  controllers: [OrdersController],
  providers: [OrderRepo, OrderService, OrderExpirationScheduler],
  exports: [OrderRepo, OrderService],
})
export class OrdersModule {}
