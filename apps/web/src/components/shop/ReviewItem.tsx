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

import { Edit2, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useDeleteReview } from '@/lib/api/hooks/use-reviews';
import { Review } from '@/lib/api/reviews';

import { DeleteReviewDialog } from './DeleteReviewDialog';
import { ReviewEditForm } from './ReviewEditForm';

interface ReviewItemProps {
  review: Review;
  currentUserId?: string;
  currentUserRole?: string;
}

export function ReviewItem({
  review,
  currentUserId,
  currentUserRole,
}: ReviewItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteReviewMutation = useDeleteReview();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const canEdit = currentUserId === review.userId;
  const canDelete = currentUserRole === 'ADMIN';

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  if (isEditing) {
    return (
      <ReviewEditForm
        review={review}
        onCancel={() => setIsEditing(false)}
        onSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
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
            <div className="mb-2 flex items-start justify-between">
              <div>
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
              </div>
              {(canEdit || canDelete) && (
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-white/60 hover:bg-white/10 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="text-white/60 hover:bg-red-400/10 hover:text-red-400"
                      disabled={deleteReviewMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            {review.comment && (
              <p className="text-white/80">{review.comment}</p>
            )}
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <DeleteReviewDialog
          reviewId={review.id}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={() => {
            deleteReviewMutation.mutate(review.id, {
              onSuccess: () => {
                setShowDeleteDialog(false);
              },
            });
          }}
          isDeleting={deleteReviewMutation.isPending}
        />
      )}
    </>
  );
}
