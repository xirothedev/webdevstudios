<script setup lang="ts">
import { ref } from 'vue';

import { Button } from '@/components/ui/button.vue';
import { useProductReviews } from '@/lib/api/hooks/use-reviews';

import ReviewItem from './review-item.vue';

import type { ProductSlug } from '@/lib/api/products';

const props = defineProps<{
  productSlug: ProductSlug;
  currentUserId?: string;
  currentUserRole?: string;
}>();

const page = ref(1);
const limit = 10;

const {
  data: reviews,
  isLoading,
  isError,
  error,
} = useProductReviews(props.productSlug, page, limit);
</script>

<template>
  <div v-if="isLoading" class="py-8 text-white/60">Đang tải đánh giá...</div>

  <div v-else-if="isError" class="py-8 text-white/60">
    <p>Không thể tải đánh giá. Vui lòng thử lại sau.</p>
    <p v-if="error instanceof Error" class="mt-2 text-sm text-white/40">{{ error.message }}</p>
  </div>

  <div
    v-else-if="!reviews || !reviews.reviews || reviews.reviews.length === 0"
    class="py-8 text-white/60"
  >
    Chưa có đánh giá nào cho sản phẩm này.
  </div>

  <div v-else class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-2xl font-bold text-white">Đánh giá ({{ reviews.total }})</h3>
    </div>

    <div class="space-y-6">
      <ReviewItem
        v-for="review in reviews.reviews"
        :key="review.id"
        :review="review"
        :current-user-id="currentUserId"
        :current-user-role="currentUserRole"
      />
    </div>

    <!-- Pagination -->
    <div v-if="reviews.totalPages > 1" class="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        :disabled="page === 1"
        class="border-white/10 text-white"
        @click="page = Math.max(1, page - 1)"
      >
        Trước
      </Button>
      <span class="text-white/60">Trang {{ page }} / {{ reviews.totalPages }}</span>
      <Button
        variant="outline"
        :disabled="page === reviews.totalPages"
        class="border-white/10 text-white"
        @click="page = Math.min(reviews.totalPages, page + 1)"
      >
        Sau
      </Button>
    </div>
  </div>
</template>
