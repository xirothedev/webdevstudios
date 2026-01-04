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
