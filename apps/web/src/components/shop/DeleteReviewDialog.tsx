'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface DeleteReviewDialogProps {
  reviewId: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteReviewDialog({
  onClose,
  onConfirm,
  isDeleting,
}: DeleteReviewDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl border border-white/10 bg-black p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Xóa đánh giá</h3>
            <p className="text-sm text-white/60">
              Chỉ admin mới có thể xóa đánh giá
            </p>
          </div>
        </div>

        <p className="mb-6 text-white/80">
          Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.
        </p>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-white/10 text-white"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-500 font-semibold text-white hover:bg-red-600"
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa đánh giá'}
          </Button>
        </div>
      </div>
    </div>
  );
}
