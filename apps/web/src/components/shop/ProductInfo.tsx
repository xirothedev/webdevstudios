'use client';

import { Star } from 'lucide-react';
import { motion } from 'motion/react';

import { ProductDescription } from '@/components/shop/ProductDescription';
import { formatPrice } from '@/lib/utils';

interface ProductInfoProps {
  name: string;
  rating: {
    value: number;
    count: number;
  };
  price: {
    current: number;
    original?: number;
    discount?: number;
  };
  description: string;
  priceNote?: string;
}

export function ProductInfo({
  name,
  rating,
  price,
  description,
  priceNote,
}: ProductInfoProps) {
  const discountPercentage = price.discount
    ? Math.round((price.discount / (price.original || price.current)) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="flex flex-col justify-center"
    >
      {/* Product Title */}
      <div className="mb-6">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
          {name}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="fill-wds-accent text-wds-accent h-4 w-4"
              />
            ))}
          </div>
          <span className="text-sm text-white/60">
            ({rating.value}) · {rating.count} đánh giá
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-white">
            {formatPrice(price.current)}₫
          </span>
          {price.original && (
            <span className="text-lg text-white/60 line-through">
              {formatPrice(price.original)}₫
            </span>
          )}
          {discountPercentage && (
            <span className="text-wds-accent bg-wds-accent/10 rounded-full px-2 py-1 text-xs font-semibold">
              -{discountPercentage}%
            </span>
          )}
        </div>
        {priceNote && <p className="mt-2 text-sm text-white/60">{priceNote}</p>}
      </div>

      {/* Description */}
      <div className="mb-8">
        <ProductDescription markdown={description} />
      </div>
    </motion.div>
  );
}
