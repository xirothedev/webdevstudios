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

import { Product, ProductSize, ProductSlug } from '@generated/prisma';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ProductWithRelations } from '../types/product.types';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: ProductSlug): Promise<ProductWithRelations | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        sizeStocks: {
          orderBy: { size: 'asc' },
        },
      },
    });
  }

  async findAll(): Promise<ProductWithRelations[]> {
    return this.prisma.product.findMany({
      where: { isPublished: true },
      include: {
        sizeStocks: {
          orderBy: { size: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<ProductWithRelations | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        sizeStocks: {
          orderBy: { size: 'asc' },
        },
      },
    });
  }

  async getStockBySize(
    productId: string,
    size: ProductSize
  ): Promise<number | null> {
    const sizeStock = await this.prisma.productSizeStock.findUnique({
      where: {
        productId_size: {
          productId,
          size,
        },
      },
    });

    return sizeStock?.stock ?? null;
  }

  async updateStock(productId: string, stock: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id: productId },
      data: { stock },
    });
  }

  async updateSizeStock(
    productId: string,
    size: ProductSize,
    stock: number
  ): Promise<void> {
    await this.prisma.productSizeStock.upsert({
      where: {
        productId_size: {
          productId,
          size,
        },
      },
      create: {
        productId,
        size,
        stock,
      },
      update: {
        stock,
      },
    });
  }

  async deleteSizeStock(productId: string, size: ProductSize): Promise<void> {
    await this.prisma.productSizeStock.delete({
      where: {
        productId_size: {
          productId,
          size,
        },
      },
    });
  }

  async decrementStock(productId: string, quantity: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  async decrementSizeStock(
    productId: string,
    size: ProductSize,
    quantity: number
  ): Promise<void> {
    await this.prisma.productSizeStock.update({
      where: {
        productId_size: {
          productId,
          size,
        },
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  async incrementStock(productId: string, quantity: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }

  async incrementSizeStock(
    productId: string,
    size: ProductSize,
    quantity: number
  ): Promise<void> {
    await this.prisma.productSizeStock.update({
      where: {
        productId_size: {
          productId,
          size,
        },
      },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }

  async updateRating(
    productId: string,
    ratingValue: number,
    ratingCount: number
  ): Promise<Product> {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ratingValue,
        ratingCount,
      },
    });
  }

  async update(
    productId: string,
    data: {
      name?: string;
      description?: string;
      priceCurrent?: number;
      priceOriginal?: number | null;
      badge?: string | null;
      isPublished?: boolean;
    }
  ): Promise<Product> {
    const updateData: {
      name?: string;
      description?: string;
      priceCurrent?: number;
      priceOriginal?: number | null;
      priceDiscount?: number | null;
      badge?: string | null;
      isPublished?: boolean;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.priceCurrent !== undefined)
      updateData.priceCurrent = data.priceCurrent;
    if (data.priceOriginal !== undefined)
      updateData.priceOriginal = data.priceOriginal;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.isPublished !== undefined)
      updateData.isPublished = data.isPublished;

    // Calculate priceDiscount if both prices are provided
    const currentPrice = data.priceCurrent;
    const originalPrice = data.priceOriginal;
    if (
      currentPrice !== undefined &&
      originalPrice !== undefined &&
      originalPrice !== null &&
      originalPrice > currentPrice
    ) {
      updateData.priceDiscount = originalPrice - currentPrice;
    } else if (originalPrice === null) {
      updateData.priceDiscount = null;
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: updateData,
    });
  }
}
