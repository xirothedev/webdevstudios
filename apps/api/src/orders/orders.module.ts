/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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
import { ListAllOrdersHandler } from './queries/list-all-orders/list-all-orders.handler';
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

const QueryHandlers = [
  GetOrderByIdHandler,
  ListOrdersHandler,
  ListAllOrdersHandler,
];

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
