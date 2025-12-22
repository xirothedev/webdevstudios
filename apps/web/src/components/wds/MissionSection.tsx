'use client';

import Image from 'next/image';
import Link from 'next/link';

export function WDSMissionSection() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h2 className="text-4xl leading-tight font-bold text-black md:text-5xl">
              Tôn chỉ
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Các thành viên tuân thủ quy định của Hội sinh viên và Câu lạc bộ.
              Tiếp thu, học hỏi kiến thức, nắm bắt xu hướng và công nghệ mới.
              Tôn trọng, chia sẻ và có trách nhiệm.
            </p>
            <Link
              href="/mission"
              className="bg-wds-accent hover:bg-wds-accent/90 inline-block rounded-lg px-6 py-3 text-base font-medium text-white transition-colors"
            >
              Đọc thêm
            </Link>
          </div>

          <div className="relative h-[400px] w-full">
            <Image
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
              alt="Team discussion"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
