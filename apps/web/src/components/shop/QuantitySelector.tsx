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

import { cva, type VariantProps } from 'class-variance-authority';
import { Minus, Plus } from 'lucide-react';

import { NumberTicker } from '@/components/ui/number-ticker';
import { cn } from '@/lib/utils';

const quantitySelectorVariants = cva(
  'flex items-center gap-2 rounded-lg border border-white/10',
  {
    variants: {
      variant: {
        default: 'bg-white/5 px-4 py-3',
        compact: 'px-1',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const quantityButtonVariants = cva(
  'cursor-pointer text-white/70 transition-colors disabled:cursor-not-allowed disabled:opacity-30 hover:text-wds-accent',
  {
    variants: {
      variant: {
        default: '',
        compact: 'h-auto px-3 py-1 hover:bg-transparent',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface QuantitySelectorProps extends VariantProps<
  typeof quantitySelectorVariants
> {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  max?: number;
  stock?: number;
  disabled?: boolean;
  showIcons?: boolean;
  className?: string;
}

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  max = 10,
  stock,
  disabled = false,
  showIcons = true,
  variant = 'default',
  size = 'md',
  className,
}: QuantitySelectorProps) {
  // Use stock if available, otherwise use max
  const maxQuantity = stock !== undefined ? stock : max;

  // Disable decrease if quantity is 1 or less, or if disabled
  const isDecreaseDisabled = disabled || quantity <= 1;

  // Disable increase if quantity reaches max (stock or max), or if disabled
  const isIncreaseDisabled = disabled || quantity >= maxQuantity;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className={cn(quantitySelectorVariants({ variant, size }))}>
        <button
          onClick={onDecrease}
          disabled={isDecreaseDisabled}
          className={cn(quantityButtonVariants({ variant, size }))}
          type="button"
          aria-label="Giảm số lượng"
        >
          {showIcons ? (
            <Minus className="h-4 w-4" />
          ) : (
            <span className="text-base">-</span>
          )}
        </button>
        <span
          className={cn(
            'min-w-8 text-center font-semibold text-white',
            variant === 'compact' && 'px-4 py-1'
          )}
        >
          {quantity}
        </span>
        <button
          onClick={onIncrease}
          disabled={isIncreaseDisabled}
          className={cn(quantityButtonVariants({ variant, size }))}
          type="button"
          aria-label="Tăng số lượng"
        >
          {showIcons ? (
            <Plus className="h-4 w-4" />
          ) : (
            <span className="text-base">+</span>
          )}
        </button>
      </div>
      {stock !== undefined && variant === 'default' && (
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
          {quantity >= stock && (
            <span className="text-wds-accent ml-2">(Đã đạt tối đa)</span>
          )}
        </span>
      )}
    </div>
  );
}
