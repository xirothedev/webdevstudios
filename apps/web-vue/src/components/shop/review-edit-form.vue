<script setup lang="ts">
import { Star, X } from 'lucide-vue-next';
import { ref } from 'vue';

import { Button } from '@/components/ui/button.vue';
import { useUpdateReview } from '@/lib/api/hooks/use-reviews';

import type { Review } from '@/lib/api/reviews';

const props = defineProps<{ review: Review }>();

const emit = defineEmits<{ cancel: []; success: [] }>();

const rating = ref(props.review.rating);
const comment = ref(props.review.comment || '');

const updateReviewMutation = useUpdateReview();

const handleSubmit = () => {
  updateReviewMutation.mutate(
    {
      reviewId: props.review.id,
      data: {
        rating: rating.value,
        comment: comment.value.trim() || null,
      },
    },
    { onSuccess: () => emit('success') },
  );
};
</script>

<template>
  <form class="rounded-xl border border-white/10 bg-white/5 p-6" @submit.prevent="handleSubmit">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-bold text-white">Chỉnh sửa đánh giá</h3>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="text-white/60 hover:text-white"
        @click="emit('cancel')"
      >
        <X class="h-4 w-4" />
      </Button>
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

    <div class="flex items-center gap-2">
      <Button
        type="submit"
        :disabled="updateReviewMutation.isPending.value"
        class="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
      >
        {{ updateReviewMutation.isPending.value ? 'Đang lưu...' : 'Lưu thay đổi' }}
      </Button>
      <Button
        type="button"
        variant="outline"
        :disabled="updateReviewMutation.isPending.value"
        class="border-white/10 text-white"
        @click="emit('cancel')"
      >
        Hủy
      </Button>
    </div>
  </form>
</template>
