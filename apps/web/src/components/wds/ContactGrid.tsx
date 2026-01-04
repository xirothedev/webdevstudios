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

import {
  Building2,
  Clock,
  Facebook,
  Mail,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { forwardRef, useRef, useState } from 'react';

import { AnimatedBeam } from '@/components/ui/animated-beam';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';

const Circle = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
  }
>(({ className, children, style }, ref) => (
  <div
    ref={ref}
    style={style}
    className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/90 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] ${className ?? ''}`}
  >
    {children}
  </div>
));
Circle.displayName = 'Circle';

function OnlineBeamBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const mailRef = useRef<HTMLDivElement>(null);
  const fbRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        ref={containerRef}
        className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white/60"
      >
        {/* Absolute positioning to keep arcs aligned like mock */}
        <Circle
          ref={mailRef}
          style={{ position: 'absolute', top: '18%', left: '26%' }}
        >
          <Image src="/icons/gmail.webp" alt="Email" width={20} height={20} />
        </Circle>
        <Circle
          ref={fbRef}
          style={{ position: 'absolute', top: '18%', right: '22%' }}
        >
          <Image
            src="/icons/facebook.webp"
            alt="Facebook"
            width={20}
            height={20}
          />
        </Circle>
        <Circle
          ref={phoneRef}
          style={{ position: 'absolute', top: '72%', left: '24%' }}
        >
          <Image
            src="/icons/telephone.webp"
            alt="Phone"
            width={20}
            height={20}
          />
        </Circle>
        <Circle
          ref={msgRef}
          style={{ position: 'absolute', top: '72%', right: '18%' }}
        >
          <Image
            src="/icons/messenger.webp"
            alt="Messenger"
            width={20}
            height={20}
          />
        </Circle>
        <Circle
          ref={centerRef}
          className="h-16 w-16 border-2"
          style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Image
            src="/image/wds-logo.svg"
            alt="WebDev Studios"
            width={32}
            height={32}
            className="h-8 w-8"
          />
        </Circle>

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={mailRef}
          toRef={centerRef}
          curvature={-60}
          endYOffset={-10}
          gradientStartColor="#ff9f43"
          gradientStopColor="#ff6f91"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={fbRef}
          toRef={centerRef}
          curvature={-55}
          endYOffset={-6}
          gradientStartColor="#3b82f6"
          gradientStopColor="#a855f7"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={phoneRef}
          toRef={centerRef}
          curvature={-5}
          startYOffset={0}
          endYOffset={-2}
          gradientStartColor="#22c55e"
          gradientStopColor="#14b8a6"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={msgRef}
          toRef={centerRef}
          curvature={30}
          endYOffset={6}
          gradientStartColor="#ec4899"
          gradientStopColor="#a855f7"
        />
      </div>
    </div>
  );
}

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
          <div className="blur-0 absolute inset-0 scale-105 bg-[url('/image/uit-school.webp')] bg-cover bg-center opacity-50" />
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
          <div className="blur-0 absolute inset-0 scale-105 bg-[url('/image/chunhiem-lamchidinh.webp')] bg-cover bg-center opacity-50" />
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
          <div className="blur-0 absolute inset-0 scale-105 bg-[url('/image/ceremony-20-12-2025.webp')] bg-cover bg-center opacity-50" />
          <div className="absolute inset-0 bg-linear-to-br from-white/80 via-white/60 to-white/30" />
        </div>
      ),
    },
    {
      Icon: Facebook,
      name: 'Kênh trực tuyến',
      description: 'Kết nối qua Fanpage, Email hoặc Messenger',
      cta: 'Chọn kênh',
      className: 'col-span-3 lg:col-span-2',
      onClick: () => setDialogOpen(true),
      background: <OnlineBeamBackground />,
    },
  ];

  return (
    <section className="relative flex snap-start items-center overflow-hidden bg-linear-to-b from-white to-gray-50 py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-wds-secondary absolute top-0 left-1/4 h-64 w-64 rounded-full opacity-20 blur-[100px]"></div>
        <div className="bg-wds-accent/10 absolute right-1/4 bottom-0 h-48 w-48 rounded-full opacity-15 blur-[80px]"></div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-black sm:text-4xl md:text-5xl">
            Liên hệ với chúng tôi
          </h2>
          <div className="from-wds-accent to-wds-accent/50 mx-auto mt-4 h-1 w-20 bg-linear-to-r"></div>
          <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với
            chúng tôi qua các kênh sau:
          </p>
        </motion.div>

        {/* Bento Grid */}
        <BentoGrid className="md:auto-rows-[18rem]">
          {contacts.map((contact, index) => (
            <BentoCard key={index} {...contact} />
          ))}
        </BentoGrid>
      </div>

      {isDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDialogOpen(false)}
          ></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  Chọn kênh liên hệ
                </h3>
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
                className="group flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Facebook className="text-wds-accent h-5 w-5" />
                  <span className="text-sm font-semibold text-neutral-800">
                    Fanpage
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  Cập nhật sự kiện và tin mới nhất.
                </p>
              </a>

              <a
                href="mailto:webdevstudios.org@gmail.com"
                className="group flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Mail className="text-wds-accent h-5 w-5" />
                  <span className="text-sm font-semibold text-neutral-800">
                    Email
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  Gửi mail để được phản hồi chi tiết.
                </p>
              </a>

              <a
                href="https://m.me"
                className="group flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="text-wds-accent h-5 w-5" />
                  <span className="text-sm font-semibold text-neutral-800">
                    Messenger
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  Chat nhanh với đội ngũ hỗ trợ.
                </p>
              </a>
            </div>
          </motion.div>
        </div>
      ) : null}
    </section>
  );
}
