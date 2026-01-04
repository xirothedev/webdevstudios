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

import { Award } from 'lucide-react';
import { motion } from 'motion/react';

import { STATS } from '@/data/achievements';

export function AchievementHero() {
  return (
    <section className="mb-24 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="border-wds-accent/30 bg-wds-accent/10 text-wds-accent mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold backdrop-blur-md"
        >
          <Award size={14} />
          <span>Bảng vàng thành tích</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mb-8 text-5xl font-extrabold tracking-tight text-white sm:text-7xl"
        >
          Hall of{' '}
          <span className="text-wds-accent relative inline-block">
            Fame
            <svg
              className="text-wds-accent absolute -bottom-1 left-0 h-3 w-full opacity-50"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
            </svg>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-lg text-pretty text-gray-400"
        >
          Những cột mốc đáng nhớ và giải thưởng danh giá đánh dấu sự nỗ lực
          không ngừng nghỉ của các thế hệ thành viên WebDev Studios.
        </motion.p>

        {/* Stats Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {STATS.map((stat) => (
            <div
              key={stat.id}
              className="hover:border-wds-accent/30 flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur-sm transition-colors"
            >
              <div className="text-wds-accent mb-1">{stat.icon}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
