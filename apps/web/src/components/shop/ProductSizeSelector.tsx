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

import { Check } from 'lucide-react';
import { motion } from 'motion/react';

import { ProductSize } from '@/lib/api/products';
import { cn } from '@/lib/utils';

interface ProductSizeSelectorProps {
  sizes: ProductSize[];
  selectedSize: ProductSize;
  onSizeChange: (size: ProductSize) => void;
  showSizeGuide?: boolean;
  stockBySize?: Record<ProductSize, number>;
}

export function ProductSizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
  showSizeGuide = true,
  stockBySize,
}: ProductSizeSelectorProps) {
  return (
    <div className="mb-8">
      <label className="mb-3 block text-sm font-semibold text-white/90">
        Chọn size
      </label>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          const stock = stockBySize?.[size] ?? undefined;
          const isOutOfStock = stock !== undefined && stock === 0;
          return (
            <button
              key={size}
              onClick={() => !isOutOfStock && onSizeChange(size)}
              disabled={isOutOfStock}
              className={cn(
                'relative flex h-12 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border-2 transition-all duration-200',
                isOutOfStock && 'cursor-not-allowed opacity-50',
                isSelected
                  ? 'border-wds-accent bg-wds-accent/10 shadow-wds-accent/20 shadow-lg'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              )}
            >
              <span
                className={cn(
                  'text-sm font-semibold',
                  isSelected ? 'text-wds-accent' : 'text-white/70',
                  isOutOfStock && 'line-through'
                )}
              >
                {size}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-wds-accent absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full"
                >
                  <Check className="h-3 w-3 text-black" />
                </motion.div>
              )}
              {stock !== undefined && stock > 0 && (
                <span className="mt-0.5 text-[10px] text-white/60">
                  {stock}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {showSizeGuide && (
        <a
          href="#size-guide"
          className="text-wds-accent hover:text-wds-accent/80 mt-2 inline-block text-xs transition-colors"
        >
          Xem bảng size →
        </a>
      )}
    </div>
  );
}
