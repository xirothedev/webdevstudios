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

import { Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function ActivityHero() {
  return (
    <section className="mb-16 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-wds-accent mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase"
            >
              <Zap size={14} /> Hoạt động sôi nổi
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight text-balance text-white sm:text-6xl"
            >
              Nơi đam mê <br />
              <span className="from-wds-accent to-wds-secondary bg-linear-to-r bg-clip-text text-transparent">
                chuyển hóa thành hành động
              </span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-sm text-sm text-pretty text-gray-400 sm:text-base md:text-right"
          >
            Hơn 50+ sự kiện mỗi năm. Từ workshop chuyên sâu, hackathon kịch tính
            đến những chuyến đi gắn kết không thể nào quên.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
