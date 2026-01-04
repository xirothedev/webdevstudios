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

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  CreateReviewRequest,
  ProductSlug,
  reviewsApi,
} from '@/lib/api/reviews';

// Query Keys
const reviewKeys = {
  all: ['reviews'] as const,
  product: (slug: ProductSlug) => [...reviewKeys.all, 'product', slug] as const,
  productList: (slug: ProductSlug, page?: number, limit?: number) =>
    [...reviewKeys.product(slug), 'list', page, limit] as const,
};

// Query: Get product reviews
export function useProductReviews(
  productSlug: ProductSlug,
  page: number = 1,
  limit: number = 10
) {
  return useQuery({
    queryKey: reviewKeys.productList(productSlug, page, limit),
    queryFn: () => reviewsApi.getProductReviews(productSlug, page, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Mutation: Create review
export function useCreateReview(productSlug: ProductSlug) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) =>
      reviewsApi.createReview(productSlug, data),
    onSuccess: () => {
      // Invalidate all reviews for this product to refetch
      queryClient.invalidateQueries({
        queryKey: reviewKeys.product(productSlug),
      });
      toast.success('Đánh giá đã được gửi thành công!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể gửi đánh giá. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Update review
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: { rating?: number; comment?: string | null };
    }) => reviewsApi.updateReview(reviewId, data),
    onSuccess: () => {
      // Invalidate all reviews queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success('Đánh giá đã được cập nhật thành công!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật đánh giá. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}

// Mutation: Delete review
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.deleteReview(reviewId),
    onSuccess: () => {
      // Invalidate all reviews queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success('Đánh giá đã được xóa thành công!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể xóa đánh giá. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}
