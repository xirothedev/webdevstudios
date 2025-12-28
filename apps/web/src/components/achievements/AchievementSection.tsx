'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface AchievementSectionProps {
  label?: string;
  title?: string;
  subtitle?: string;
}

export function AchievementSection({
  label,
  title,
  subtitle,
}: AchievementSectionProps) {
  return (
    <div className="mb-16 flex flex-col gap-3 text-center">
      {label && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-wds-accent flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase"
        >
          <Sparkles size={12} /> {label} <Sparkles size={12} />
        </motion.span>
      )}

      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-balance text-white sm:text-5xl"
        >
          {title}
        </motion.h2>
      )}

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-2 max-w-2xl text-pretty text-gray-400"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
