import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductDto, ProductListResponseDto } from '../../dtos/product.dto';
import { ProductRepository } from '../../infrastructure/product.repository';
import { ProductWithRelations } from '../../types/product.types';
import { ListProductsQuery } from './list-products.query';

@QueryHandler(ListProductsQuery)
export class ListProductsHandler implements IQueryHandler<ListProductsQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(_query: ListProductsQuery): Promise<ProductListResponseDto> {
    // TODO: Add pagination
    const products = await this.productRepository.findAll();

    return {
      products: products.map((product) => this.mapToDto(product)),
      total: products.length,
    };
  }

  private mapToDto(product: ProductWithRelations): ProductDto {
    const stockStatus = this.calculateStockStatus(product);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      priceCurrent: Number(product.priceCurrent),
      priceOriginal: product.priceOriginal
        ? Number(product.priceOriginal)
        : null,
      priceDiscount: product.priceDiscount
        ? Number(product.priceDiscount)
        : null,
      stock: product.stock,
      hasSizes: product.hasSizes,
      badge: product.badge,
      ratingValue: Number(product.ratingValue),
      ratingCount: product.ratingCount,
      sizeStocks: product.sizeStocks?.map((ss) => ({
        size: ss.size,
        stock: ss.stock,
      })),
      stockStatus,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private calculateStockStatus(
    product: ProductWithRelations
  ): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (product.hasSizes && product.sizeStocks?.length > 0) {
      const totalStock = product.sizeStocks.reduce(
        (sum, ss) => sum + ss.stock,
        0
      );
      if (totalStock === 0) return 'out_of_stock';
      if (totalStock < 5) return 'low_stock';
      return 'in_stock';
    }

    if (product.stock === 0) return 'out_of_stock';
    if (product.stock < 5) return 'low_stock';
    return 'in_stock';
  }
}
