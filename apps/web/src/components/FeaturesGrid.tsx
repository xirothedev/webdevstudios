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

import { Circle, Shirt, ShoppingBag, Star } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: string;
}

function GlassCard({
  children,
  className = '',
  colSpan = 'col-span-1',
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      className={`${colSpan} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function FeaturesGrid() {
  return (
    <section className="relative py-24">
      {/* Background ambient glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-wds-accent/20 absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-purple-500/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Bộ sưu tập <span className="text-white/50">độc quyền.</span>
          </h2>
          <p className="max-w-lg text-white/70">
            Khám phá các sản phẩm được thiết kế riêng cho thành viên WebDev
            Studios với chất lượng cao và thiết kế độc đáo.
          </p>
        </div>

        <div className="grid auto-rows-[340px] grid-cols-1 gap-6 md:grid-cols-3">
          {/* Feature 1: WDS T-shirt (Large) */}
          <GlassCard colSpan="md:col-span-2">
            <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl">
              {/* Animated border gradient */}
              <div className="from-wds-accent to-wds-accent absolute inset-0 bg-linear-to-r via-purple-500 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-50" />

              {/* Glass shine effect */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent" />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-between p-8">
                <div className="flex-1">
                  <div className="border-wds-accent/30 bg-wds-accent/10 text-wds-accent shadow-wds-accent/20 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg">
                    <Shirt className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-white">
                    Áo thun WebDev Studios
                  </h3>
                  <p className="max-w-md text-sm text-white/60">
                    Áo thun chất lượng cao với logo WebDev Studios, size đa
                    dạng. Thiết kế độc đáo.
                  </p>
                </div>

                {/* Product Image with Parallax (Hero-style, larger + stronger hover) */}
                <div className="relative flex justify-end">
                  <Link href="/shop/ao-thun" className="cursor-pointer">
                    <motion.div
                      className="relative h-60 w-80 md:h-72 md:w-104 lg:h-80 lg:w-120"
                      whileHover={{ scale: 1.12, y: -16, rotate: -2 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      style={{
                        translateZ: 70,
                      }}
                    >
                      <div className="from-wds-accent/40 via-wds-accent/15 absolute inset-0 bg-linear-to-t to-transparent blur-3xl" />
                      <Image
                        src="/shop/ao-thun.webp"
                        alt="Áo thun WebDev Studios"
                        fill
                        sizes="(max-width: 768px) 320px, (max-width: 1024px) 416px, 480px"
                        className="relative z-10 object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
                      />
                    </motion.div>
                  </Link>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Feature 2: Keychain WebDev Studios */}
          <GlassCard>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl">
              <div className="absolute inset-0 bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-50" />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent" />

              <div className="relative z-10 flex h-full flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-400/10 text-purple-400 shadow-lg shadow-purple-400/20">
                  <Circle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  Móc khóa WebDev Studios
                </h3>
                <p className="mb-4 flex-1 text-sm text-white/60">
                  Móc khóa kim loại với logo WebDev Studios, thiết kế độc đáo và
                  bền chắc. Phù hợp để treo chìa khóa, túi xách hoặc làm vật
                  trang trí.
                </p>

                <Link href="/shop/moc-khoa" className="cursor-pointer">
                  <motion.div
                    className="relative mx-auto h-40 w-40"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    style={{ translateZ: 40 }}
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-purple-500/30 to-transparent blur-2xl" />
                    <Image
                      src="/shop/moc-khoa.webp"
                      alt="Móc khóa WebDev Studios"
                      fill
                      className="relative z-10 object-contain drop-shadow-xl"
                      sizes="160px"
                    />
                  </motion.div>
                </Link>
              </div>
            </div>
          </GlassCard>

          {/* Feature 3: Lanyard WebDev Studios */}
          <GlassCard>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl">
              <div className="absolute inset-0 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-50" />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent" />

              <div className="relative z-10 flex h-full flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-lg shadow-emerald-400/20">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  Dây đeo WebDev Studios
                </h3>
                <p className="mb-4 flex-1 text-sm text-white/60">
                  Dây đeo (lanyard) nằm ngang với branding WebDev Studios, tiện
                  lợi cho thẻ nhân viên, thẻ hội viên hoặc keychain.
                </p>

                <Link href="/shop/day-deo" className="cursor-pointer">
                  <motion.div
                    className="relative h-44 w-full"
                    whileHover={{ scale: 1.06, y: -8 }}
                    transition={{ duration: 0.3 }}
                    style={{ translateZ: 40 }}
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-emerald-500/30 to-transparent blur-2xl" />
                    <Image
                      src="/shop/day-deo.webp"
                      alt="Dây đeo WebDev Studios"
                      fill
                      className="relative z-10 object-contain drop-shadow-xl"
                      sizes="320px"
                    />
                  </motion.div>
                </Link>
              </div>
            </div>
          </GlassCard>

          {/* Feature 4: Mouse Pad WebDev Studios Limited Edition (Large) */}
          <GlassCard colSpan="md:col-span-2">
            <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl">
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'linear',
                }}
              />

              <div className="absolute inset-0 bg-linear-to-r from-amber-500 via-orange-500 to-amber-500 opacity-30 blur-sm" />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent" />

              <div className="relative z-10 flex h-full flex-row items-center gap-8 p-8">
                <div className="flex-1">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400 shadow-lg shadow-amber-400/20">
                    <Star className="h-7 w-7" />
                  </div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 shadow-lg shadow-amber-400/20">
                    <motion.div
                      className="h-2 w-2 rounded-full bg-amber-400"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-xs font-bold tracking-widest text-amber-300 uppercase">
                      Limited Edition
                    </span>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-white">
                    Pad chuột WebDev Studios Limited Edition
                  </h3>
                  <p className="text-sm text-white/60">
                    Pad chuột cỡ lớn phiên bản giới hạn với thiết kế WebDev
                    Studios, tối ưu cho developer và designer thường xuyên dùng
                    chuột.
                  </p>
                </div>

                <Link
                  href="/shop/pad-chuot"
                  className="hidden cursor-pointer sm:block"
                >
                  <motion.div
                    className="relative h-56 w-56"
                    whileHover={{ scale: 1.08, rotate: 360 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    style={{ translateZ: 60 }}
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-amber-500/40 via-orange-500/20 to-transparent blur-3xl" />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-amber-400/30"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <Image
                      src="/shop/pad-chuot.webp"
                      alt="Pad chuột WebDev Studios Limited Edition"
                      fill
                      className="relative z-10 object-contain drop-shadow-2xl"
                      sizes="224px"
                    />
                  </motion.div>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
