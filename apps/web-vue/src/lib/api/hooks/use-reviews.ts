import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

import { type CreateReviewRequest, type ProductSlug, reviewsApi } from '@/lib/api/reviews';
import { toast } from '@/lib/toast';

// Reactive-params convention: see note in use-orders.ts

// Query Keys
export const reviewKeys = {
  all: ['reviews'] as const,
  product: (slug: ProductSlug) => [...reviewKeys.all, 'product', slug] as const,
  productList: (slug: ProductSlug, page?: number, limit?: number) =>
    [...reviewKeys.product(slug), 'list', page, limit] as const,
};

// Query: Get product reviews
export function useProductReviews(
  productSlug: MaybeRefOrGetter<ProductSlug>,
  page: MaybeRefOrGetter<number> = 1,
  limit: MaybeRefOrGetter<number> = 10,
) {
  return useQuery({
    queryKey: computed(() =>
      reviewKeys.productList(toValue(productSlug), toValue(page), toValue(limit)),
    ),
    queryFn: () =>
      reviewsApi.getProductReviews(toValue(productSlug), toValue(page), toValue(limit)),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Mutation: Create review
export function useCreateReview(productSlug: MaybeRefOrGetter<ProductSlug>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewsApi.createReview(toValue(productSlug), data),
    onSuccess: () => {
      // Invalidate all reviews for this product to refetch
      queryClient.invalidateQueries({
        queryKey: reviewKeys.product(toValue(productSlug)),
      });
      toast.success('Đánh giá đã được gửi thành công!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể gửi đánh giá. Vui lòng thử lại.';
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
        error instanceof Error ? error.message : 'Không thể cập nhật đánh giá. Vui lòng thử lại.';
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
        error instanceof Error ? error.message : 'Không thể xóa đánh giá. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });
}
