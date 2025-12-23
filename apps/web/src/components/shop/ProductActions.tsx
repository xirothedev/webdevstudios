'use client';

import { ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductActionsProps {
  onAddToCart: () => Promise<void> | void;
  onBuyNow?: () => void;
  isAddingToCart?: boolean;
  addToCartText?: string;
  buyNowText?: string;
}

export function ProductActions({
  onAddToCart,
  onBuyNow,
  isAddingToCart = false,
  addToCartText = 'Thêm vào giỏ hàng',
  buyNowText = 'Mua ngay',
}: ProductActionsProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
      <Button
        onClick={onAddToCart}
        disabled={isAddingToCart}
        className={cn(
          'group bg-wds-accent hover:bg-wds-accent/90 hover:shadow-wds-accent/30 relative h-14 flex-1 overflow-hidden rounded-full font-semibold text-black transition-all hover:shadow-lg',
          isAddingToCart && 'cursor-wait'
        )}
      >
        {isAddingToCart ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-5 w-5 rounded-full border-2 border-black border-t-transparent"
            />
            <span>Đang thêm...</span>
          </motion.div>
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
          variant="outline"
          className="border-wds-accent/30 text-wds-accent hover:bg-wds-accent/10 h-14 rounded-full border px-6 font-semibold"
        >
          {buyNowText}
        </Button>
      )}
    </div>
  );
}
