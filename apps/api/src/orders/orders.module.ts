import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CartModule } from '../cart/cart.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
// Commands
import { CancelOrderHandler } from './commands/cancel-order/cancel-order.handler';
import { CreateOrderHandler } from './commands/create-order/create-order.handler';
import { UpdateOrderStatusHandler } from './commands/update-order-status/update-order-status.handler';
// Repository
import { OrderRepository } from './infrastructure/order.repository';
// Controller
import { OrdersController } from './orders.controller';
// Queries
import { GetOrderByIdHandler } from './queries/get-order-by-id/get-order-by-id.handler';
import { ListOrdersHandler } from './queries/list-orders/list-orders.handler';

const CommandHandlers = [
  CreateOrderHandler,
  UpdateOrderStatusHandler,
  CancelOrderHandler,
];

const QueryHandlers = [GetOrderByIdHandler, ListOrdersHandler];

@Module({
  imports: [CqrsModule, PrismaModule, CartModule, ProductsModule],
  controllers: [OrdersController],
  providers: [...CommandHandlers, ...QueryHandlers, OrderRepository],
  exports: [OrderRepository],
})
export class OrdersModule {}
