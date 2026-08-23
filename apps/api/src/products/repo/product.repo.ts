import { Prisma, Product, ProductSize, ProductSlug } from '@prisma/client';
import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import { PRODUCT_SELECT, type ProductWithRelations } from './product.selects';

export type StockItem = {
  productId: string;
  size: ProductSize | null;
  quantity: number;
};

export function availableStock(
  product: Pick<ProductWithRelations, 'hasSizes' | 'stock' | 'sizeStocks'>,
  size?: ProductSize | null,
): number | null {
  if (!product.hasSizes || !size) {
    return product.stock;
  }
  return product.sizeStocks.find((sizeStock) => sizeStock.size === size)?.stock ?? null;
}

@Injectable()
export class ProductRepo {
  constructor(private readonly prisma: PrismaService) {}

  async reserve(tx: Prisma.TransactionClient | undefined, items: StockItem[]): Promise<void> {
    const client = tx ?? this.prisma;

    for (const item of items) {
      const result = item.size
        ? await client.productSizeStock.updateMany({
            where: { productId: item.productId, size: item.size, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          })
        : await client.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });

      if (result.count === 0) {
        throw new ConflictException(
          `Insufficient stock for product ${item.productId}${item.size ? ` (${item.size})` : ''}`,
        );
      }
    }
  }

  async release(tx: Prisma.TransactionClient | undefined, items: StockItem[]): Promise<void> {
    const client = tx ?? this.prisma;

    for (const item of items) {
      if (item.size) {
        await client.productSizeStock.updateMany({
          where: { productId: item.productId, size: item.size },
          data: { stock: { increment: item.quantity } },
        });
      } else {
        await client.product.updateMany({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  }

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
