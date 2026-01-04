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

// Commands
import { UpdateProductHandler } from './commands/update-product/update-product.handler';
import { UpdateProductSizesHandler } from './commands/update-product-sizes/update-product-sizes.handler';
import { UpdateProductStockHandler } from './commands/update-product-stock/update-product-stock.handler';
// Repository
import { ProductRepository } from './infrastructure/product.repository';
// Controller
import { ProductsController } from './products.controller';
// Queries
import { GetProductBySlugHandler } from './queries/get-product-by-slug/get-product-by-slug.handler';
import { GetProductStockHandler } from './queries/get-product-stock/get-product-stock.handler';
import { ListProductsHandler } from './queries/list-products/list-products.handler';

const CommandHandlers = [
  UpdateProductHandler,
  UpdateProductStockHandler,
  UpdateProductSizesHandler,
];

const QueryHandlers = [
  GetProductBySlugHandler,
  GetProductStockHandler,
  ListProductsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [ProductsController],
  providers: [...CommandHandlers, ...QueryHandlers, ProductRepository],
  exports: [ProductRepository],
})
export class ProductsModule {}
