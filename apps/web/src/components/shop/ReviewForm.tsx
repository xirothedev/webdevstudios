'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCreateReview } from '@/lib/api/hooks/use-reviews';
import { ProductSlug } from '@/lib/api/products';

interface ReviewFormProps {
  productSlug: ProductSlug;
  onSuccess?: () => void;
}

export function ReviewForm({ productSlug, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const createReviewMutation = useCreateReview(productSlug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          // Call onSuccess callback if provided
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
      <h3 className="mb-4 text-xl font-bold text-white">Viết đánh giá</h3>

      <div className="mb-4">
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

      <div className="mb-4">
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
