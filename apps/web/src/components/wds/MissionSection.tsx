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
import Image from 'next/image';
import Link from 'next/link';

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
};

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] },
};

export function WDSMissionSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-gray-50 to-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Image - First on mobile, second on desktop */}
          <motion.div
            className="relative order-2 h-[400px] w-full sm:h-[500px] lg:order-1"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInLeft}
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-lg">
              <Image
                src="/image/ton-chi.webp"
                alt="Tôn chỉ của WebDev Studios - Tuân thủ quy định, học hỏi và phát triển"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain object-center"
              />
              {/* Gradient overlay */}
              <div className="from-wds-accent/10 absolute inset-0 bg-linear-to-br via-transparent to-transparent"></div>
            </div>
            {/* Decorative element */}
            <div className="bg-wds-accent/10 absolute -right-4 -bottom-4 -z-10 h-32 w-32 rounded-full blur-2xl"></div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="order-1 space-y-6 md:space-y-8 lg:order-2"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInRight}
          >
            <div>
              <h2 className="text-3xl leading-tight font-bold text-black sm:text-4xl md:text-5xl">
                Tôn chỉ
              </h2>
              <div className="from-wds-accent to-wds-accent/50 mt-4 h-1 w-20 bg-linear-to-r"></div>
            </div>

            <div className="space-y-4">
              <p className="text-base leading-relaxed text-gray-700 sm:text-lg md:text-xl">
                Các thành viên tuân thủ quy định của Hội sinh viên và Câu lạc
                bộ. Tiếp thu, học hỏi kiến thức, nắm bắt xu hướng và công nghệ
                mới. Tôn trọng, chia sẻ và có trách nhiệm.
              </p>
            </div>

            <Link
              href="/mission"
              className="group border-wds-accent text-wds-accent hover:bg-wds-accent focus:ring-wds-accent relative inline-flex items-center gap-2 overflow-hidden rounded-lg border-2 bg-transparent px-8 py-4 text-base font-semibold transition-all duration-300 hover:text-black focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              <span className="relative z-10">Đọc thêm</span>
              <motion.span
                className="relative z-10"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
