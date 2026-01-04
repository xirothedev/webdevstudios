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

import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProductDto } from '../../dtos/product.dto';
import { ProductRepository } from '../../infrastructure/product.repository';
import { ProductWithRelations } from '../../types/product.types';
import { GetProductBySlugQuery } from './get-product-by-slug.query';

@QueryHandler(GetProductBySlugQuery)
export class GetProductBySlugHandler implements IQueryHandler<GetProductBySlugQuery> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(query: GetProductBySlugQuery): Promise<ProductDto> {
    const { slug } = query;

    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return this.mapToDto(product);
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
      isPublished: product.isPublished,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private calculateStockStatus(
    product: ProductWithRelations
  ): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (product.hasSizes && product.sizeStocks?.length > 0) {
      // For products with sizes, check if any size has stock
      const totalStock = product.sizeStocks.reduce(
        (sum, ss) => sum + ss.stock,
        0
      );
      if (totalStock === 0) return 'out_of_stock';
      if (totalStock < 5) return 'low_stock';
      return 'in_stock';
    }

    // For products without sizes, use main stock
    if (product.stock === 0) return 'out_of_stock';
    if (product.stock < 5) return 'low_stock';
    return 'in_stock';
  }
}
