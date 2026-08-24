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

import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
// Controller
import { ReviewsController } from './reviews.controller';
// Repository
import { ReviewRepo } from './repo';
// Service
import { ReviewsService } from './services/reviews.service';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [ReviewsController],
  providers: [ReviewRepo, ReviewsService],
  exports: [ReviewRepo, ReviewsService],
})
export class ReviewsModule {}
