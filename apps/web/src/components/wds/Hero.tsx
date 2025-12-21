'use client';

import Image from 'next/image';
import Link from 'next/link';

export function WDSHero() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h1 className="text-5xl leading-tight font-bold text-black md:text-6xl">
              Chúng tôi là <br />
              <span className="text-wds-accent">WebDev Studios</span>
            </h1>
            <p className="text-lg leading-relaxed text-gray-700">
              WebDev Studios là nơi tập hợp các bạn sinh viên có niềm đam mê với
              Lập trình Web nhằm tạo ra một môi trường học tập và giải trí để
              các bạn có thể học hỏi, trau dồi kỹ năng…
            </p>
            <Link
              href="/about"
              className="bg-wds-accent hover:bg-wds-accent/90 inline-block rounded-lg px-6 py-3 text-base font-medium text-white transition-colors"
            >
              Đọc thêm
            </Link>
          </div>

          <div className="relative h-[500px] w-full">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
              alt="Person working on laptop"
              fill
              className="object-contain"
              priority
            />
            <div className="bg-wds-secondary absolute top-1/2 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
