'use client';

import Image from 'next/image';
import Link from 'next/link';

export function WDSClientsSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative order-2 h-[400px] w-full lg:order-1">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
              alt="Team collaboration"
              fill
              className="object-contain"
            />
          </div>

          <div className="order-1 space-y-6 lg:order-2">
            <h2 className="text-4xl leading-tight font-bold text-black md:text-5xl">
              Các tệp khách hàng
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              WebDev Studios từng vinh dự được hợp tác và nhận sự tin tưởng từ
              các đối tác: ...
            </p>
            <Link
              href="/clients"
              className="bg-wds-accent hover:bg-wds-accent/90 inline-block rounded-lg px-6 py-3 text-base font-medium text-white transition-colors"
            >
              Đọc thêm
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
