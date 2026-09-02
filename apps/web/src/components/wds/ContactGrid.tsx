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

import { Building2, Clock, Mail, MessageCircle, Phone } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { LazyInView } from '@/components/common/lazy-in-view';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';

// ponytail: motion-powered beam chunk is fetched only when the card nears the viewport
const loadBeam = () => import('./ContactBeam');

export function WDSContactGrid() {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const contacts = [
    {
      Icon: Building2,
      name: 'Văn phòng',
      description: 'B8.04, tòa B, Đại học Công nghệ Thông Tin, ĐHQG TP.HCM',
      href: 'https://maps.google.com/?q=Đại+học+Công+nghệ+Thông+Tin+ĐHQG+TP.HCM',
      cta: 'Xem bản đồ',
      className: 'col-span-3 lg:col-span-2',
      background: (
        <div className="absolute inset-0">
          <Image
            src="/image/uit-school.webp"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 64vw"
            className="scale-105 object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-linear-to-br from-white/80 via-white/60 to-white/30" />
        </div>
      ),
    },
    {
      Icon: Phone,
      name: 'Liên hệ công việc',
      description: 'Chủ nhiệm - Lâm Chí Dĩnh: 0794161275',
      href: 'tel:0794161275',
      cta: 'Gửi email',
      className: 'col-span-3 lg:col-span-1',
      background: (
        <div className="absolute inset-0">
          <Image
            src="/image/chunhiem-lamchidinh.webp"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 32vw"
            className="scale-105 object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-linear-to-br from-white/80 via-white/60 to-white/30" />
        </div>
      ),
    },
    {
      Icon: Clock,
      name: 'Giờ mở cửa',
      description: '7h30 - 15h30',
      href: '#',
      cta: 'Xem chi tiết',
      className: 'col-span-3 lg:col-span-1',
      background: (
        <div className="absolute inset-0">
          <Image
            src="/image/ceremony-20-12-2025.webp"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 64vw"
            className="scale-105 object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-linear-to-br from-white/80 via-white/60 to-white/30" />
        </div>
      ),
    },
    {
      Icon: MessageCircle,
      name: 'Kênh trực tuyến',
      description: 'Kết nối qua Fanpage, Email hoặc Messenger',
      cta: 'Chọn kênh',
      className: 'col-span-3 lg:col-span-2',
      onClick: () => setDialogOpen(true),
      background: <LazyInView className="pointer-events-none absolute inset-0" load={loadBeam} />,
    },
  ];

  return (
    <section className="relative flex snap-start items-center overflow-hidden bg-linear-to-b from-white to-gray-50 py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-wds-secondary absolute top-0 left-1/4 size-64 rounded-full opacity-20 blur-[100px]"></div>
        <div className="bg-wds-accent/10 absolute right-1/4 bottom-0 size-48 rounded-full opacity-15 blur-[80px]"></div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="reveal mb-12 text-center">
          <h2 className="text-3xl font-semibold text-black sm:text-4xl md:text-5xl">
            Liên hệ với chúng tôi
          </h2>
          <div className="from-wds-accent to-wds-accent/50 mx-auto mt-4 h-1 w-20 bg-linear-to-r"></div>
          <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh
            sau:
          </p>
        </div>

        {/* Bento Grid */}
        <BentoGrid className="md:auto-rows-72">
          {contacts.map((contact) => (
            <BentoCard key={contact.name} {...contact} />
          ))}
        </BentoGrid>
      </div>

      {isDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Đóng hộp thoại chọn kênh liên hệ"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDialogOpen(false)}
          />
          <div className="animate-in fade-in-0 zoom-in-95 relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl motion-reduce:animate-none">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">Chọn kênh liên hệ</h3>
                <p className="text-sm text-neutral-600">
                  Kết nối nhanh qua Fanpage, Email hoặc Messenger.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                className="rounded-full bg-neutral-100 text-sm font-medium text-neutral-700! hover:bg-neutral-200"
              >
                Đóng
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <a
                href="https://facebook.com"
                className="group flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="text-wds-accent size-5" />
                  <span className="text-sm font-semibold text-neutral-800">Fanpage</span>
                </div>
                <p className="text-xs text-neutral-600">Cập nhật sự kiện và tin mới nhất.</p>
              </a>

              <a
                href="mailto:webdevstudios.org@gmail.com"
                className="group flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Mail className="text-wds-accent size-5" />
                  <span className="text-sm font-semibold text-neutral-800">Email</span>
                </div>
                <p className="text-xs text-neutral-600">Gửi mail để được phản hồi chi tiết.</p>
              </a>

              <a
                href="https://m.me"
                className="group flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="text-wds-accent size-5" />
                  <span className="text-sm font-semibold text-neutral-800">Messenger</span>
                </div>
                <p className="text-xs text-neutral-600">Chat nhanh với đội ngũ hỗ trợ.</p>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
