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
