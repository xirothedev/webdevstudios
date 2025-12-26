import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { ReviewWithRelations } from '../types/review.types';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    productId: string;
    rating: number;
    comment?: string | null;
  }): Promise<ReviewWithRelations> {
    return this.prisma.review.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<ReviewWithRelations | null> {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });
  }

  async findByProductId(
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: ReviewWithRelations[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: { productId },
      }),
    ]);

    return { reviews, total };
  }

  async findByUserAndProduct(userId: string, productId: string) {
    return this.prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });
  }

  async update(
    id: string,
    data: { rating?: number; comment?: string | null }
  ): Promise<ReviewWithRelations> {
    return this.prisma.review.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.review.delete({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async calculateProductRating(productId: string): Promise<{
    ratingValue: number;
    ratingCount: number;
  }> {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return { ratingValue: 0, ratingCount: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const ratingValue = totalRating / reviews.length;
    const ratingCount = reviews.length;

    return {
      ratingValue: Math.round(ratingValue * 100) / 100, // Round to 2 decimal places
      ratingCount,
    };
  }
}
