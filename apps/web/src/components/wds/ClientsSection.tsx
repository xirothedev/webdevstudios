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

export function WDSClientsSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-wds-secondary absolute top-1/2 right-0 h-64 w-64 rounded-full opacity-20 blur-[100px]"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Content */}
          <div className="reveal order-1 space-y-6 md:space-y-8 lg:order-1">
            <div>
              <h2 className="text-3xl leading-tight font-bold text-black sm:text-4xl md:text-5xl">
                Các đối tác khách hàng
              </h2>
              <div className="from-wds-accent to-wds-accent/50 mt-4 h-1 w-20 bg-linear-to-r"></div>
            </div>

            <p className="text-base leading-relaxed text-gray-700 sm:text-lg md:text-xl">
              WebDev Studios từng vinh dự được hợp tác và nhận sự tin tưởng từ các đối tác uy tín.
              Chúng tôi tự hào về những dự án đã hoàn thành và mối quan hệ hợp tác bền chặt với
              khách hàng.
            </p>

            <Link
              href="/clients"
              className="group bg-wds-accent hover:bg-wds-accent/90 hover:shadow-wds-accent/30 focus:ring-wds-accent relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-8 py-4 text-base font-semibold text-black transition-all duration-300 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              <span className="relative z-10">Đọc thêm</span>
              <span className="relative z-10 transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* Image */}
          <div className="reveal relative order-2">
            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-lg">
              <Image
                src="/image/khach-hang.webp"
                alt="Đối tác và khách hàng của WebDev Studios"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-center"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-tl from-black/20 via-transparent to-transparent"></div>
            </div>
            {/* Decorative element */}
            <div className="bg-wds-accent/10 absolute -top-4 -left-4 -z-10 h-32 w-32 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
