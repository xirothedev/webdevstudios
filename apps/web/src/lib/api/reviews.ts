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

import { apiClient } from '../api-client';
import { ProductSlug } from './products';

export type { ProductSlug };

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  userFullName: string;
  userAvatar: string | null;
  productId: string;
  productSlug: ProductSlug;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string | null;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string | null;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const reviewsApi = {
  /**
   * Get product reviews
   */
  async getProductReviews(
    productSlug: ProductSlug,
    page?: number,
    limit?: number
  ): Promise<ReviewListResponse> {
    const params: Record<string, string> = {};
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();
    const response = await apiClient.get<{ data: ReviewListResponse }>(
      `/products/${productSlug}/reviews`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Create review
   */
  async createReview(
    productSlug: ProductSlug,
    data: CreateReviewRequest
  ): Promise<Review> {
    const response = await apiClient.post<{ data: Review }>(
      `/products/${productSlug}/reviews`,
      data
    );
    return response.data.data;
  },

  /**
   * Update review
   */
  async updateReview(
    reviewId: string,
    data: UpdateReviewRequest
  ): Promise<Review> {
    const response = await apiClient.patch<{ data: Review }>(
      `/products/reviews/${reviewId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete review
   */
  async deleteReview(reviewId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ data: { success: boolean } }>(
      `/products/reviews/${reviewId}`
    );
    return response.data.data;
  },
};
