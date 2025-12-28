'use client';

import { motion } from 'motion/react';

interface PartnerSectionProps {
  label?: string;
  title?: string;
  subtitle?: string;
}

export function PartnerSection({
  label,
  title,
  subtitle,
}: PartnerSectionProps) {
  return (
    <div className="mb-12 flex flex-col gap-3 text-center">
      {label && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-wds-accent text-xs font-bold tracking-widest uppercase"
        >
          {label}
        </motion.span>
      )}
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-balance text-white md:text-4xl"
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
          className="mx-auto max-w-2xl text-pretty text-gray-400"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
