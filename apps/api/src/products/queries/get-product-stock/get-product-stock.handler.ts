import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { StockInfoDto } from '../../dtos/product.dto';
import { ProductRepository } from '../../infrastructure/product.repository';
import { GetProductStockQuery } from './get-product-stock.query';

@QueryHandler(GetProductStockQuery)
export class GetProductStockHandler implements IQueryHandler<GetProductStockQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductStockQuery): Promise<StockInfoDto> {
    const { slug, size } = query;

    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    if (product.hasSizes) {
      // Product with sizes - return size-specific stock
      const sizeStocks =
        product.sizeStocks?.map((ss) => ({
          size: ss.size,
          stock: ss.stock,
        })) || [];

      // If specific size requested, return that size's stock
      if (size) {
        const sizeStock = sizeStocks.find((ss) => ss.size === size);
        if (!sizeStock) {
          throw new NotFoundException(
            `Size ${size} not found for product ${slug}`
          );
        }

        const stockStatus = this.calculateStockStatus(sizeStock.stock);
        return {
          stock: sizeStock.stock,
          stockStatus,
          sizeStocks,
        };
      }

      // Return all sizes
      const totalStock = sizeStocks.reduce((sum, ss) => sum + ss.stock, 0);
      const stockStatus = this.calculateStockStatus(totalStock);

      return {
        stock: totalStock,
        stockStatus,
        sizeStocks,
      };
    }

    // Product without sizes - return main stock
    const stockStatus = this.calculateStockStatus(product.stock);
    return {
      stock: product.stock,
      stockStatus,
      sizeStocks: null,
    };
  }

  private calculateStockStatus(
    stock: number
  ): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (stock === 0) return 'out_of_stock';
    if (stock < 5) return 'low_stock';
    return 'in_stock';
  }
}
