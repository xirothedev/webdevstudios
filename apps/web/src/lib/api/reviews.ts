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
    const response = await apiClient.get<ReviewListResponse>(
      `/products/${productSlug}/reviews`,
      { params }
    );
    return response.data;
  },

  /**
   * Create review
   */
  async createReview(
    productSlug: ProductSlug,
    data: CreateReviewRequest
  ): Promise<Review> {
    const response = await apiClient.post<Review>(
      `/products/${productSlug}/reviews`,
      data
    );
    return response.data;
  },

  /**
   * Update review
   */
  async updateReview(
    reviewId: string,
    data: UpdateReviewRequest
  ): Promise<Review> {
    const response = await apiClient.patch<Review>(
      `/products/reviews/${reviewId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete review
   */
  async deleteReview(reviewId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/products/reviews/${reviewId}`
    );
    return response.data;
  },
};
