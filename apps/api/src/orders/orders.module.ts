import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';

import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
// Commands
import { CancelOrderHandler } from './commands/cancel-order/cancel-order.handler';
import { CreateOrderHandler } from './commands/create-order/create-order.handler';
import { ExpireOrderHandler } from './commands/expire-order/expire-order.handler';
import { UpdateOrderStatusHandler } from './commands/update-order-status/update-order-status.handler';
// Repository
import { OrderRepository } from './infrastructure/order.repository';
// Controller
import { OrdersController } from './orders.controller';
// Queries
import { GetOrderByIdHandler } from './queries/get-order-by-id/get-order-by-id.handler';
import { ListOrdersHandler } from './queries/list-orders/list-orders.handler';
// Schedulers
import { OrderExpirationScheduler } from './schedulers/order-expiration.scheduler';
import { OrderRecoveryScheduler } from './schedulers/order-recovery.scheduler';

const CommandHandlers = [
  CreateOrderHandler,
  UpdateOrderStatusHandler,
  CancelOrderHandler,
  ExpireOrderHandler,
];

const QueryHandlers = [GetOrderByIdHandler, ListOrdersHandler];

@Module({
  imports: [CqrsModule, ScheduleModule, CartModule, ProductsModule],
  controllers: [OrdersController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    OrderRepository,
    OrderExpirationScheduler,
    OrderRecoveryScheduler,
  ],
  exports: [OrderRepository],
})
export class OrdersModule {}
