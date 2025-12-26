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
  const isDecreaseDisabled = disabled || quantity <= 1;
  const isIncreaseDisabled = disabled || quantity >= max;

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
        </span>
      )}
    </div>
  );
}
