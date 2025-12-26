'use client';

import { QuantitySelector } from './QuantitySelector';

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
      <QuantitySelector
        quantity={quantity}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        max={max}
        stock={stock}
        variant="default"
        showIcons={true}
      />
    </div>
  );
}
