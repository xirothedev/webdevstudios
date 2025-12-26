'use client';

import { Minus, Plus } from 'lucide-react';

import { NumberTicker } from '@/components/ui/number-ticker';

interface ProductQuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  max?: number;
  stock?: number;
}

export function ProductQuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  max = 10,
  stock,
}: ProductQuantitySelectorProps) {
  return (
    <div className="mb-8">
      <label className="mb-3 block text-sm font-semibold text-white/90">
        Số lượng
      </label>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <button
            onClick={onDecrease}
            disabled={quantity <= 1}
            className="hover:text-wds-accent cursor-pointer text-white/70 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-8 text-center font-semibold text-white">
            {quantity}
          </span>
          <button
            onClick={onIncrease}
            disabled={quantity >= max}
            className="hover:text-wds-accent cursor-pointer text-white/70 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {stock !== undefined && (
          <span className="text-sm text-white/60">
            Còn lại:{' '}
            <span className="font-semibold text-white">
              <NumberTicker
                value={stock}
                startValue={stock}
                className="text-white"
              />
            </span>{' '}
            sản phẩm
          </span>
        )}
      </div>
    </div>
  );
}
