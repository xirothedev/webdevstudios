import { Prisma, Product, ProductSize, ProductSlug } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';

import { ProductWithRelations } from '../product.types';

const PRODUCT_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  priceCurrent: true,
  priceOriginal: true,
  priceDiscount: true,
  stock: true,
  hasSizes: true,
  badge: true,
  ratingValue: true,
  ratingCount: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
  sizeStocks: {
    orderBy: { size: 'asc' as const },
  },
} satisfies Prisma.ProductSelect;

@Injectable()
export class ProductRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: ProductSlug): Promise<ProductWithRelations | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      select: PRODUCT_SELECT,
    });
  }

  async findAll(): Promise<ProductWithRelations[]> {
    return this.prisma.product.findMany({
      where: { isPublished: true },
      select: PRODUCT_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<ProductWithRelations | null> {
    return this.prisma.product.findUnique({
      where: { id },
      select: PRODUCT_SELECT,
    });
  }

  async getStockBySize(productId: string, size: ProductSize): Promise<number | null> {
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

  async updateStock(
    productId: string,
    stock: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Product> {
    return (tx ?? this.prisma).product.update({
      where: { id: productId },
      data: { stock },
    });
  }

  async updateSizeStock(
    productId: string,
    size: ProductSize,
    stock: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await (tx ?? this.prisma).productSizeStock.upsert({
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

  async deleteSizeStock(
    productId: string,
    size: ProductSize,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await (tx ?? this.prisma).productSizeStock.delete({
      where: {
        productId_size: {
          productId,
          size,
        },
      },
    });
  }

  async decrementStock(
    productId: string,
    quantity: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Product> {
    return (tx ?? this.prisma).product.update({
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
    quantity: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await (tx ?? this.prisma).productSizeStock.update({
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

  async incrementStock(
    productId: string,
    quantity: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Product> {
    return (tx ?? this.prisma).product.update({
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
    quantity: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await (tx ?? this.prisma).productSizeStock.update({
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
    ratingCount: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Product> {
    return (tx ?? this.prisma).product.update({
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
    },
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
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priceCurrent !== undefined) updateData.priceCurrent = data.priceCurrent;
    if (data.priceOriginal !== undefined) updateData.priceOriginal = data.priceOriginal;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

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
