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

import Image from 'next/image';
import Link from 'next/link';

// ponytail: motion/react removed — hero paints before hydration; reveals are CSS-only
export function WDSHero() {
  return (
    <section className="relative overflow-hidden bg-white py-10 sm:py-30 md:py-24 lg:py-1">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-wds-secondary absolute top-1/4 right-0 h-96 w-96 rounded-full opacity-30 blur-[120px]"></div>
        <div className="bg-wds-accent/10 absolute bottom-1/4 left-0 h-80 w-80 rounded-full opacity-20 blur-[100px]"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Content */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-8 space-y-6 duration-700 motion-reduce:animate-none md:space-y-8">
            <div>
              <h1 className="text-4xl leading-tight font-bold text-black sm:text-5xl md:text-6xl lg:text-7xl">
                Chúng tôi là <br />
                <span className="from-wds-accent to-wds-accent/80 bg-linear-to-r bg-clip-text text-transparent">
                  WebDev Studios
                </span>
              </h1>
            </div>

            <p className="text-base leading-relaxed text-gray-700 sm:text-lg md:text-xl">
              WebDev Studios là nơi tập hợp các bạn sinh viên có niềm đam mê với Lập trình Web nhằm
              tạo ra một môi trường học tập và giải trí để các bạn có thể học hỏi, trau dồi kỹ năng
              và phát triển bản thân.
            </p>

            <div>
              <Link
                href="/about"
                className="group bg-wds-accent hover:bg-wds-accent/90 hover:shadow-wds-accent/30 focus:ring-wds-accent relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-8 py-4 text-base font-semibold text-black transition-all duration-300 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <span className="relative z-10">Đọc thêm</span>
                <span className="relative z-10 transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
                <span className="from-wds-accent to-wds-accent/80 absolute inset-0 -translate-x-full bg-linear-to-r transition-transform duration-300 group-hover:translate-x-0" />
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-[400px] w-full sm:h-[500px] lg:h-[600px]">
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              <Image
                src="/image/hero-image.webp"
                alt="WebDev Studios - Câu lạc bộ lập trình web của sinh viên UIT"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain object-center"
                priority
                fetchPriority="high"
              />
            </div>

            {/* Decorative elements */}
            <div className="bg-wds-secondary absolute -top-4 -right-4 -z-10 h-64 w-64 animate-pulse rounded-full opacity-40 blur-3xl" />
            <div className="bg-wds-accent/20 absolute -bottom-4 -left-4 -z-10 h-48 w-48 animate-pulse rounded-full opacity-30 blur-2xl [animation-delay:500ms]" />
          </div>
        </div>
      </div>
    </section>
  );
}
