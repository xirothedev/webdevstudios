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
  imports: [CqrsModule, ProductsModule],
  controllers: [CartController],
  providers: [...CommandHandlers, ...QueryHandlers, CartRepository],
  exports: [CartRepository],
})
export class CartModule {}
