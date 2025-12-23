'use client';

import { motion } from 'motion/react';

import { ProductInfo } from '@/types/product';

interface ProductAdditionalInfoProps {
  info: ProductInfo;
  title?: string;
  delay?: number;
}

export function ProductAdditionalInfo({
  info,
  title = 'Thông tin sản phẩm',
  delay = 0.3,
}: ProductAdditionalInfoProps) {
  const entries = Object.entries(info).filter(([_, value]) => value);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="mt-20"
    >
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {entries.map(([key, value]) => (
            <div key={key}>
              <h3 className="text-wds-accent mb-2 text-sm font-semibold tracking-wider uppercase">
                {key}
              </h3>
              <p className="text-sm text-white/70">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
