import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { OrdersModule } from '@/orders/orders.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { ProductsModule } from '@/products/products.module';

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
  imports: [CqrsModule, PrismaModule, ProductsModule, OrdersModule],
  controllers: [ReviewsController],
  providers: [...CommandHandlers, ...QueryHandlers, ReviewRepository],
  exports: [ReviewRepository],
})
export class ReviewsModule {}
