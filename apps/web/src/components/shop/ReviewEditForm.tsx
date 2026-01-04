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

import { Star, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useUpdateReview } from '@/lib/api/hooks/use-reviews';
import { Review } from '@/lib/api/reviews';

interface ReviewEditFormProps {
  review: Review;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function ReviewEditForm({
  review,
  onCancel,
  onSuccess,
}: ReviewEditFormProps) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment || '');

  const updateReviewMutation = useUpdateReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateReviewMutation.mutate(
      {
        reviewId: review.id,
        data: {
          rating,
          comment: comment.trim() || null,
        },
      },
      {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess();
          }
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/5 p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Chỉnh sửa đánh giá</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-white/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop: 2 columns, Mobile: 1 column */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* Left column: Rating */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-white/90">
            Đánh giá *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    i <= rating
                      ? 'fill-wds-accent text-wds-accent'
                      : 'text-white/20 hover:text-white/40'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right column: Comment */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-white/90">
            Nhận xét
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="focus:border-wds-accent w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={updateReviewMutation.isPending}
          className="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
        >
          {updateReviewMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updateReviewMutation.isPending}
          className="border-white/10 text-white"
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
