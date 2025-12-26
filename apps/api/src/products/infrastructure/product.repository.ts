import { Product, ProductSize, ProductSlug } from '@generated/prisma';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

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
}
