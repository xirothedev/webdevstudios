'use client';

import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ProductSlug } from '@/lib/api/products';
import { ReviewListResponse, reviewsApi } from '@/lib/api/reviews';

interface ProductReviewsProps {
  productSlug: ProductSlug;
}

export function ProductReviews({ productSlug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchReviews();
  }, [productSlug, page]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const data = await reviewsApi.getProductReviews(productSlug, page, limit);
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading && !reviews) {
    return <div className="py-8 text-white/60">Đang tải đánh giá...</div>;
  }

  if (!reviews || reviews.reviews.length === 0) {
    return (
      <div className="py-8 text-white/60">
        Chưa có đánh giá nào cho sản phẩm này.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">
          Đánh giá ({reviews.total})
        </h3>
      </div>

      <div className="space-y-6">
        {reviews.reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                {review.userAvatar ? (
                  <img
                    src={review.userAvatar}
                    alt={review.userFullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="font-semibold text-white">
                    {review.userFullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="mb-1 font-semibold text-white">
                  {review.userFullName}
                </p>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i <= review.rating
                            ? 'fill-wds-accent text-wds-accent'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-white/60">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-white/80">{review.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {reviews.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            className="border-white/10 text-white"
          >
            Trước
          </Button>
          <span className="text-white/60">
            Trang {page} / {reviews.totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(reviews.totalPages, p + 1))}
            disabled={page === reviews.totalPages}
            variant="outline"
            className="border-white/10 text-white"
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
