import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
// Controller
import { CartController } from './cart.controller';
// Commands
import { AddToCartHandler } from './commands/add-to-cart/add-to-cart.handler';
import { ClearCartHandler } from './commands/clear-cart/clear-cart.handler';
import { RemoveFromCartHandler } from './commands/remove-from-cart/remove-from-cart.handler';
import { UpdateCartItemHandler } from './commands/update-cart-item/update-cart-item.handler';
// Repository
import { CartRepository } from './infrastructure/cart.repository';
// Queries
import { GetCartHandler } from './queries/get-cart/get-cart.handler';

const CommandHandlers = [
  AddToCartHandler,
  UpdateCartItemHandler,
  RemoveFromCartHandler,
  ClearCartHandler,
];

const QueryHandlers = [GetCartHandler];

@Module({
  imports: [CqrsModule, PrismaModule, ProductsModule],
  controllers: [CartController],
  providers: [...CommandHandlers, ...QueryHandlers, CartRepository],
  exports: [CartRepository],
})
export class CartModule {}
