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

import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
// Commands
import { CreateReviewHandler } from './commands/create-review/create-review.handler';
import { DeleteReviewHandler } from './commands/delete-review/delete-review.handler';
import { UpdateReviewHandler } from './commands/update-review/update-review.handler';
// Repository
import { ReviewRepository } from './infrastructure/review.repository';
// Queries
import { GetProductReviewsHandler } from './queries/get-product-reviews/get-product-reviews.handler';
// Controller
import { ReviewsController } from './reviews.controller';

const CommandHandlers = [
  CreateReviewHandler,
  UpdateReviewHandler,
  DeleteReviewHandler,
];

const QueryHandlers = [GetProductReviewsHandler];

@Module({
  imports: [CqrsModule, ProductsModule, OrdersModule],
  controllers: [ReviewsController],
  providers: [...CommandHandlers, ...QueryHandlers, ReviewRepository],
  exports: [ReviewRepository],
})
export class ReviewsModule {}
