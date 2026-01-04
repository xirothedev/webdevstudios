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

import { Edit2, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  useCreateReview,
  useProductReviews,
} from '@/lib/api/hooks/use-reviews';
import { ProductSlug } from '@/lib/api/products';

import { ReviewEditForm } from './ReviewEditForm';

interface ReviewFormProps {
  productSlug: ProductSlug;
  currentUserId?: string;
  onSuccess?: () => void;
}

export function ReviewForm({
  productSlug,
  currentUserId,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Check if user has already reviewed
  const { data: reviewsData } = useProductReviews(productSlug, 1, 100);
  const existingReview = useMemo(() => {
    if (!currentUserId || !reviewsData) return null;
    return reviewsData.reviews.find(
      (review) => review.userId === currentUserId
    );
  }, [currentUserId, reviewsData]);

  const createReviewMutation = useCreateReview(productSlug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    createReviewMutation.mutate(
      {
        rating,
        comment: comment.trim() || null,
      },
      {
        onSuccess: () => {
          // Reset form
          setComment('');
          setRating(5);
          setErrorMessage(null);
          // Call onSuccess callback if provided
          if (onSuccess) {
            onSuccess();
          }
        },
        onError: (error: unknown) => {
          // Handle different error types
          if (error && typeof error === 'object' && 'message' in error) {
            const message = (error as { message: string }).message;
            if (
              message.includes('purchase') ||
              message.includes('must purchase')
            ) {
              setErrorMessage('Bạn cần mua sản phẩm này trước khi đánh giá.');
            } else if (
              message.includes('already reviewed') ||
              message.includes('Conflict')
            ) {
              setErrorMessage('Bạn đã đánh giá sản phẩm này rồi.');
            } else {
              setErrorMessage(message);
            }
          } else {
            setErrorMessage('Không thể gửi đánh giá. Vui lòng thử lại.');
          }
        },
      }
    );
  };

  // If user has already reviewed, show edit option
  if (existingReview && !isEditing) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-lg font-bold text-white">
              Bạn đã đánh giá sản phẩm này
            </p>
            <p className="text-sm text-white/60">
              Bạn có thể chỉnh sửa đánh giá của mình.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="border-white/10 text-white"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
        </div>
      </div>
    );
  }

  if (existingReview && isEditing) {
    return (
      <ReviewEditForm
        review={existingReview}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => {
          setIsEditing(false);
          if (onSuccess) {
            onSuccess();
          }
        }}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/5 p-6"
    >
      <h3 className="mb-4 text-xl font-bold text-white">Viết đánh giá</h3>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

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

      <Button
        type="submit"
        disabled={createReviewMutation.isPending}
        className="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
      >
        {createReviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
      </Button>
    </form>
  );
}
