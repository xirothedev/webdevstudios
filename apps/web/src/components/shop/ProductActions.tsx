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

import { ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from 'cn';

interface ProductActionsProps {
  onAddToCart: () => Promise<void> | void;
  onBuyNow?: () => void;
  isAddingToCart?: boolean;
  disabled?: boolean;
  addToCartText?: string;
  buyNowText?: string;
}

export function ProductActions({
  onAddToCart,
  onBuyNow,
  isAddingToCart = false,
  disabled = false,
  addToCartText = 'Thêm vào giỏ hàng',
  buyNowText = 'Mua ngay',
}: ProductActionsProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
      <Button
        onClick={onAddToCart}
        disabled={isAddingToCart || disabled}
        className={cn(
          'group bg-wds-accent hover:bg-wds-accent/90 hover:shadow-wds-accent/30 relative h-14 flex-1 overflow-hidden rounded-full font-semibold text-black transition-all hover:shadow-lg',
          (isAddingToCart || disabled) && 'cursor-wait opacity-50',
        )}
      >
        {isAddingToCart ? (
          <div className="animate-in fade-in-0 flex items-center gap-2 duration-200">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            <span>Đang thêm...</span>
          </div>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            {addToCartText}
          </>
        )}
      </Button>
      {onBuyNow && (
        <Button
          onClick={onBuyNow}
          disabled={disabled}
          variant="outline"
          className={cn(
            'border-wds-accent/30 text-wds-accent hover:bg-wds-accent/10 h-14 rounded-full border px-6 font-semibold',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          {buyNowText}
        </Button>
      )}
    </div>
  );
}
