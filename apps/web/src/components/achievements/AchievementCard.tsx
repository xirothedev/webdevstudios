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

import { motion } from 'motion/react';

import type { AwardItem } from '@/data/achievements';

interface AchievementCardProps {
  item: AwardItem;
  index: number;
}

export function AchievementCard({ item, index }: AchievementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group hover:border-wds-accent/50 hover:bg-wds-accent/5 relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
    >
      {/* Decorative Gradient Blob */}
      <div className="bg-wds-accent/10 group-hover:bg-wds-accent/20 absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-all" />

      <div className="flex items-start justify-between">
        <div className="group-hover:text-wds-accent group-hover:ring-wds-accent/30 rounded-xl bg-white/5 p-3 text-white ring-1 ring-white/10 transition-colors">
          {item.icon}
        </div>
        <span className="border-wds-accent/20 bg-wds-accent/10 text-wds-accent rounded-full border px-3 py-1 text-xs font-semibold">
          {item.rank}
        </span>
      </div>

      <div className="relative z-10">
        <h3 className="group-hover:text-wds-accent text-xl font-bold text-white transition-colors duration-200">
          {item.title}
        </h3>
        <p className="mt-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
          {item.organizer}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-400 group-hover:text-gray-300">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}
