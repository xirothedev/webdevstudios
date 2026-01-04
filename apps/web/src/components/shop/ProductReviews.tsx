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

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useProductReviews } from '@/lib/api/hooks/use-reviews';
import { ProductSlug } from '@/lib/api/products';

import { ReviewItem } from './ReviewItem';

interface ProductReviewsProps {
  productSlug: ProductSlug;
  currentUserId?: string;
  currentUserRole?: string;
}

export function ProductReviews({
  productSlug,
  currentUserId,
  currentUserRole,
}: ProductReviewsProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: reviews,
    isLoading,
    isError,
    error,
  } = useProductReviews(productSlug, page, limit);

  if (isLoading) {
    return <div className="py-8 text-white/60">Đang tải đánh giá...</div>;
  }

  if (isError) {
    return (
      <div className="py-8 text-white/60">
        <p>Không thể tải đánh giá. Vui lòng thử lại sau.</p>
        {error instanceof Error && (
          <p className="mt-2 text-sm text-white/40">{error.message}</p>
        )}
      </div>
    );
  }

  if (!reviews || !reviews.reviews || reviews.reviews.length === 0) {
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
          <ReviewItem
            key={review.id}
            review={review}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />
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
