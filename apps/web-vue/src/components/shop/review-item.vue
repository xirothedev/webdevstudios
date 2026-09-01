<script setup lang="ts">
import { Edit2, Star, Trash2 } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import { Button } from '@/components/ui/button.vue';
import { useDeleteReview } from '@/lib/api/hooks/use-reviews';
import { formatDateLong } from '@/lib/date';

import DeleteReviewDialog from './delete-review-dialog.vue';
import ReviewEditForm from './review-edit-form.vue';

import type { Review } from '@/lib/api/reviews';

const props = defineProps<{
  review: Review;
  currentUserId?: string;
  currentUserRole?: string;
}>();

const isEditing = ref(false);
const showDeleteDialog = ref(false);
const deleteReviewMutation = useDeleteReview();

const canEdit = computed(() => props.currentUserId === props.review.userId);
const canDelete = computed(() => props.currentUserRole === 'ADMIN');

const handleDeleteConfirm = () => {
  deleteReviewMutation.mutate(props.review.id, {
    onSuccess: () => {
      showDeleteDialog.value = false;
    },
  });
};
</script>

<template>
  <ReviewEditForm
    v-if="isEditing"
    :review="review"
    @cancel="isEditing = false"
    @success="isEditing = false"
  />

  <template v-else>
    <div class="rounded-xl border border-white/10 bg-white/5 p-6">
      <div class="mb-4 flex items-start gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <img
            v-if="review.userAvatar"
            :src="review.userAvatar"
            :alt="review.userFullName"
            class="h-12 w-12 rounded-full object-cover"
          />
          <span v-else class="font-semibold text-white">
            {{ review.userFullName.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="flex-1">
          <div class="mb-2 flex items-start justify-between">
            <div>
              <p class="mb-1 font-semibold text-white">{{ review.userFullName }}</p>
              <div class="mb-2 flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    class="h-4 w-4"
                    :class="
                      i <= review.rating ? 'fill-wds-accent text-wds-accent' : 'text-white/20'
                    "
                  />
                </div>
                <span class="text-sm text-white/60">{{ formatDateLong(review.createdAt) }}</span>
              </div>
            </div>
            <div v-if="canEdit || canDelete" class="flex items-center gap-2">
              <Button
                v-if="canEdit"
                variant="ghost"
                size="sm"
                class="text-white/60 hover:bg-white/10 hover:text-white"
                @click="isEditing = true"
              >
                <Edit2 class="h-4 w-4" />
              </Button>
              <Button
                v-if="canDelete"
                variant="ghost"
                size="sm"
                :disabled="deleteReviewMutation.isPending.value"
                class="text-white/60 hover:bg-red-400/10 hover:text-red-400"
                @click="showDeleteDialog = true"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p v-if="review.comment" class="text-white/80">{{ review.comment }}</p>
        </div>
      </div>
    </div>

    <DeleteReviewDialog
      v-if="showDeleteDialog"
      :is-deleting="deleteReviewMutation.isPending.value"
      @close="showDeleteDialog = false"
      @confirm="handleDeleteConfirm"
    />
  </template>
</template>
