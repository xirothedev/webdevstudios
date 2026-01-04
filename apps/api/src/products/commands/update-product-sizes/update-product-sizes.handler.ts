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

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ProductDto } from '../../dtos/product.dto';
import { ProductRepository } from '../../infrastructure/product.repository';
import { ProductWithRelations } from '../../types/product.types';
import { UpdateProductSizesCommand } from './update-product-sizes.command';

@CommandHandler(UpdateProductSizesCommand)
export class UpdateProductSizesHandler implements ICommandHandler<UpdateProductSizesCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: UpdateProductSizesCommand): Promise<ProductDto> {
    const { productId, sizeStocks } = command;

    // Validate input
    if (!Array.isArray(sizeStocks) || sizeStocks.length === 0) {
      throw new BadRequestException('sizeStocks must be a non-empty array');
    }

    // Check for negative stock
    const hasNegativeStock = sizeStocks.some((ss) => ss.stock < 0);
    if (hasNegativeStock) {
      throw new BadRequestException('Stock cannot be negative');
    }

    // Get product
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    // Validate product has sizes
    if (!product.hasSizes) {
      throw new BadRequestException(
        'Product does not support size-specific stock'
      );
    }

    // Update all size stocks (upsert - creates if not exists, updates if exists)
    for (const sizeStock of sizeStocks) {
      await this.productRepository.updateSizeStock(
        productId,
        sizeStock.size,
        sizeStock.stock
      );
    }

    // Recalculate total stock from ALL sizes in database (not just updated ones)
    // This ensures total stock is always accurate
    const updatedProduct = await this.productRepository.findById(productId);
    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }

    // Calculate total from all sizeStocks in database
    if (updatedProduct.sizeStocks && updatedProduct.sizeStocks.length > 0) {
      const totalStock = updatedProduct.sizeStocks.reduce(
        (sum, ss) => sum + ss.stock,
        0
      );
      await this.productRepository.updateStock(productId, totalStock);
    } else {
      // If no size stocks exist, set total to 0
      await this.productRepository.updateStock(productId, 0);
    }

    // Get final product state
    const finalProduct = await this.productRepository.findById(productId);
    if (!finalProduct) {
      throw new NotFoundException('Product not found after stock update');
    }

    return this.mapToDto(finalProduct);
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
