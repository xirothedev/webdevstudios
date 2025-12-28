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
