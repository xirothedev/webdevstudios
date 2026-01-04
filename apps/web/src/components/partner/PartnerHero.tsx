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

import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export function PartnerHero() {
  return (
    <section className="mb-24 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="border-wds-accent/30 bg-wds-accent/10 text-wds-accent mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="bg-wds-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
            <span className="bg-wds-accent relative inline-flex h-2 w-2 rounded-full"></span>
          </span>
          Mạng lưới kết nối
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
        >
          Đồng hành cùng <br />
          <span className="from-wds-accent to-wds-secondary bg-linear-to-r bg-clip-text text-transparent">
            WebDev Studios
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-pretty text-gray-400"
        >
          Chúng tôi tự hào được hợp tác với các doanh nghiệp công nghệ hàng đầu
          và các tổ chức uy tín để mang lại giá trị thực tiễn cho cộng đồng sinh
          viên IT.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="#contact"
            className="bg-wds-accent flex h-12 items-center gap-2 rounded-full px-8 font-semibold text-black transition-colors duration-200 hover:bg-white"
          >
            Trở thành đối tác <ArrowRight size={18} />
          </Link>
          <button className="h-12 rounded-full border border-white/20 px-8 text-white transition-colors duration-200 hover:bg-white/10">
            Tải hồ sơ năng lực
          </button>
        </motion.div>
      </div>
    </section>
  );
}
