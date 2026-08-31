<script setup lang="ts">
import { Edit2, Star } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import { Button } from '@/components/ui/button.vue';
import { useCreateReview, useProductReviews } from '@/lib/api/hooks/use-reviews';

import ReviewEditForm from './review-edit-form.vue';

import type { ProductSlug } from '@/lib/api/products';

const props = defineProps<{
  productSlug: ProductSlug;
  currentUserId?: string;
}>();

const emit = defineEmits<{ success: [] }>();

const rating = ref(5);
const comment = ref('');
const errorMessage = ref<string | null>(null);
const isEditing = ref(false);

// Check if user has already reviewed
const { data: reviewsData } = useProductReviews(props.productSlug, 1, 100);
const existingReview = computed(() => {
  if (!props.currentUserId || !reviewsData.value) return null;
  return reviewsData.value.reviews.find((review) => review.userId === props.currentUserId);
});

const createReviewMutation = useCreateReview(props.productSlug);

const handleSubmit = () => {
  errorMessage.value = null;

  createReviewMutation.mutate(
    {
      rating: rating.value,
      comment: comment.value.trim() || null,
    },
    {
      onSuccess: () => {
        // Reset form
        comment.value = '';
        rating.value = 5;
        errorMessage.value = null;
        emit('success');
      },
      onError: (error: unknown) => {
        // Handle different error types
        if (error && typeof error === 'object' && 'message' in error) {
          const message = (error as { message: string }).message;
          if (message.includes('purchase') || message.includes('must purchase')) {
            errorMessage.value = 'Bạn cần mua sản phẩm này trước khi đánh giá.';
          } else if (message.includes('already reviewed') || message.includes('Conflict')) {
            errorMessage.value = 'Bạn đã đánh giá sản phẩm này rồi.';
          } else {
            errorMessage.value = message;
          }
        } else {
          errorMessage.value = 'Không thể gửi đánh giá. Vui lòng thử lại.';
        }
      },
    },
  );
};
</script>

<template>
  <!-- If user has already reviewed, show edit option -->
  <div v-if="existingReview && !isEditing" class="rounded-xl border border-white/10 bg-white/5 p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="mb-1 text-lg font-bold text-white">Bạn đã đánh giá sản phẩm này</p>
        <p class="text-sm text-white/60">Bạn có thể chỉnh sửa đánh giá của mình.</p>
      </div>
      <Button variant="outline" class="border-white/10 text-white" @click="isEditing = true">
        <Edit2 class="mr-2 h-4 w-4" />
        Chỉnh sửa
      </Button>
    </div>
  </div>

  <ReviewEditForm
    v-else-if="existingReview"
    :review="existingReview"
    @cancel="isEditing = false"
    @success="
      () => {
        isEditing = false;
        emit('success');
      }
    "
  />

  <form
    v-else
    class="rounded-xl border border-white/10 bg-white/5 p-6"
    @submit.prevent="handleSubmit"
  >
    <h3 class="mb-4 text-xl font-bold text-white">Viết đánh giá</h3>

    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
      <p class="text-sm text-red-400">{{ errorMessage }}</p>
    </div>

    <!-- Desktop: 2 columns, Mobile: 1 column -->
    <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      <!-- Left column: Rating -->
      <div>
        <label class="mb-2 block text-sm font-semibold text-white/90">Đánh giá *</label>
        <div class="flex items-center gap-2">
          <button
            v-for="i in 5"
            :key="i"
            type="button"
            class="focus:outline-none"
            @click="rating = i"
          >
            <Star
              class="h-6 w-6 transition-colors"
              :class="
                i <= rating
                  ? 'fill-wds-accent text-wds-accent'
                  : 'text-white/20 hover:text-white/40'
              "
            />
          </button>
        </div>
      </div>

      <!-- Right column: Comment -->
      <div>
        <label class="mb-2 block text-sm font-semibold text-white/90">Nhận xét</label>
        <textarea
          v-model="comment"
          rows="4"
          class="focus:border-wds-accent w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
        />
      </div>
    </div>

    <Button
      type="submit"
      :disabled="createReviewMutation.isPending.value"
      class="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
    >
      {{ createReviewMutation.isPending.value ? 'Đang gửi...' : 'Gửi đánh giá' }}
    </Button>
  </form>
</template>
