'use client';

import { Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductFeaturesProps {
  features: string[];
  title?: string;
}

export function ProductFeatures({
  features,
  title = 'Đặc điểm nổi bật',
}: ProductFeaturesProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="mb-4 text-sm font-semibold tracking-wider text-white/90 uppercase">
        {title}
      </h3>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center gap-3 text-sm text-white/70"
          >
            <div className="bg-wds-accent/20 flex h-5 w-5 items-center justify-center rounded-full">
              <Check className="text-wds-accent h-3 w-3" />
            </div>
            {feature}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
