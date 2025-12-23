'use client';

import { Check } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';
import { ProductSize } from '@/types/product';

interface ProductSizeSelectorProps {
  sizes: ProductSize[];
  selectedSize: ProductSize;
  onSizeChange: (size: ProductSize) => void;
  showSizeGuide?: boolean;
}

export function ProductSizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
  showSizeGuide = true,
}: ProductSizeSelectorProps) {
  return (
    <div className="mb-8">
      <label className="mb-3 block text-sm font-semibold text-white/90">
        Chọn size
      </label>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={cn(
                'relative h-12 w-16 cursor-pointer rounded-xl border-2 transition-all duration-200',
                isSelected
                  ? 'border-wds-accent bg-wds-accent/10 shadow-wds-accent/20 shadow-lg'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              )}
            >
              <span
                className={cn(
                  'text-sm font-semibold',
                  isSelected ? 'text-wds-accent' : 'text-white/70'
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
