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

import { ArrowLeft, Home, Search } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [floatingElements, setFloatingElements] = useState<
    Array<{
      initialX: number;
      initialY: number;
      animateX: number;
      animateY: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Generate random positions only on client side
    setFloatingElements(
      Array.from({ length: 6 }, () => ({
        initialX: Math.random() * 400 - 200,
        initialY: Math.random() * 400 - 200,
        animateX: Math.random() * 400 - 200,
        animateY: Math.random() * 400 - 200,
        duration: 3 + Math.random() * 2,
      }))
    );
  }, []);

  return (
    <div className="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text relative min-h-screen overflow-hidden">
      <Navbar />

      {/* Background ambient glow with mouse tracking */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="bg-wds-accent/20 absolute h-[60%] w-[60%] rounded-full blur-[120px]"
          animate={{
            x: `${mousePosition.x * 0.5}%`,
            y: `${mousePosition.y * 0.5}%`,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          style={{
            left: '20%',
            top: '20%',
          }}
        />
        <motion.div
          className="absolute h-[50%] w-[50%] rounded-full bg-purple-500/20 blur-[120px]"
          animate={{
            x: `${mousePosition.x * -0.3}%`,
            y: `${mousePosition.y * -0.3}%`,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          style={{
            right: '10%',
            bottom: '10%',
          }}
        />
      </div>

      {/* Retro Grid Pattern */}
      <div className="retro-grid pointer-events-none fixed inset-0 z-0 opacity-40" />

      <main className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 pt-24 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Animated 404 Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
            className="mb-8"
          >
            <motion.h1
              className="relative inline-block"
              animate={{
                rotate: [0, -5, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
            >
              <span className="from-wds-accent via-wds-accent to-wds-accent/60 bg-linear-to-b bg-clip-text text-9xl font-bold tracking-tight text-transparent drop-shadow-[0_0_40px_rgba(247,147,30,0.5)] md:text-[12rem]">
                404
              </span>
              {/* Glow effect behind 404 */}
              <motion.div
                className="bg-wds-accent/30 absolute inset-0 -z-10 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.h1>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Trang không tồn tại
            </h2>
            <p className="mx-auto max-w-lg text-lg text-white/70">
              Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã bị di
              chuyển. Hãy quay lại trang chủ hoặc khám phá các sản phẩm của
              chúng tôi.
            </p>
          </motion.div>

          {/* Animated Floating Elements */}
          <div className="relative mb-12">
            {floatingElements.map((element, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: element.initialX,
                  y: element.initialY,
                }}
                animate={{
                  opacity: [0, 0.3, 0],
                  scale: [0, 1, 0],
                  x: element.animateX,
                  y: element.animateY,
                }}
                transition={{
                  duration: element.duration,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut',
                }}
              >
                <div className="bg-wds-accent/40 h-2 w-2 rounded-full blur-sm" />
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/"
              className="group bg-wds-accent hover:bg-wds-accent/90 hover:shadow-wds-accent/30 relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-base font-semibold text-black transition-all hover:shadow-lg"
            >
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: 'linear',
                }}
              />
              <Home className="relative z-10 h-5 w-5" />
              <span className="relative z-10">Về trang chủ</span>
            </Link>

            <Link
              href="/shop"
              className="group border-wds-accent/30 text-wds-accent hover:border-wds-accent hover:bg-wds-accent/10 relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border-2 bg-transparent px-6 py-3 text-base font-semibold transition-all"
            >
              <Search className="h-5 w-5" />
              <span>Khám phá Shop</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-white/70 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Quay lại</span>
            </button>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16"
          >
            <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h3 className="text-wds-accent mb-4 text-sm font-semibold tracking-wider uppercase">
                Gợi ý cho bạn
              </h3>
              <ul className="space-y-2 text-left text-sm text-white/70">
                {[
                  { label: 'Trang chủ', href: '/' },
                  { label: 'Về chúng tôi', href: '/about' },
                  { label: 'Shop', href: '/shop' },
                  { label: 'Thế hệ', href: '/generation' },
                  { label: 'FAQ', href: '/faq' },
                ].map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="hover:text-wds-accent flex items-center gap-2 transition-colors"
                    >
                      <span className="bg-wds-accent h-1.5 w-1.5 rounded-full" />
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
