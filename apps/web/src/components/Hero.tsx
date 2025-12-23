'use client';

import { Package, Users } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/shop/ao-thun.webp"
          alt="Background"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Retro Grid Background */}
      <div className="retro-grid pointer-events-none absolute inset-0 z-1 opacity-40"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm"
        >
          <span className="bg-wds-accent flex h-2 w-2 rounded-full"></span>
          <span className="text-[10px] font-medium tracking-wider text-white uppercase">
            WebDev Studios Official Store
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 bg-linear-to-b from-white to-white/60 bg-clip-text text-5xl leading-[1.1] font-semibold tracking-tight text-transparent md:text-7xl"
        >
          Vật phẩm câu lạc bộ <br />
          chính thức của WDS.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-12 max-w-xl text-lg text-white/70"
        >
          Khám phá bộ sưu tập độc quyền áo thun, mũ, túi và nhiều vật phẩm khác
          mang đậm dấu ấn WebDev Studios.
        </motion.p>

        {/* 3D Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 15 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="group relative mx-auto max-w-4xl perspective-distant"
        >
          {/* Glow behind */}
          <div className="bg-wds-accent/20 absolute top-1/2 left-1/2 h-[50%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"></div>

          {/* Main Interface */}
          <div className="tilt-card bg-card relative z-10 transform-gpu overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            {/* Border Beam Effect */}
            <div className="pointer-events-none absolute inset-0 z-20">
              <div className="via-wds-accent absolute top-0 left-1/4 h-px w-1/2 bg-linear-to-r from-transparent to-transparent opacity-50 blur-sm"></div>
            </div>

            {/* Mockup Header */}
            <div className="flex h-10 items-center gap-2 border-b border-white/5 bg-[#161719] px-4">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
              </div>
              <div className="flex-1 text-center font-mono text-[10px] text-zinc-600">
                wds.shop/products
              </div>
            </div>

            {/* Mockup Content (Dashboard) */}
            <div className="bg-primary grid grid-cols-12 gap-6 p-6">
              {/* Sidebar */}
              <div className="col-span-3 hidden space-y-4 md:block">
                <div className="h-4 w-20 animate-pulse rounded bg-zinc-800"></div>
                <div className="space-y-2 pt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-zinc-800 bg-zinc-900"></div>
                      <div className="h-2 w-16 rounded bg-zinc-900"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Area */}
              <div className="col-span-12 space-y-6 md:col-span-9">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="mb-1 text-xs text-zinc-500">
                      Sản phẩm đã bán
                    </div>
                    <div className="text-2xl font-medium tracking-tight text-white">
                      1,247 sản phẩm
                    </div>
                  </div>
                  <div className="border-wds-accent/20 bg-wds-accent/10 text-wds-accent flex h-8 w-24 items-center justify-center rounded-md border text-xs">
                    Mới
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="from-wds-accent/5 relative flex h-48 w-full items-end gap-2 overflow-hidden rounded-lg border border-white/5 bg-linear-to-b to-transparent px-4 pb-2">
                  {[40, 60, 45, 80, 55, 90, 70, 60, 50, 75, 85, 95].map(
                    (h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{
                          duration: 1,
                          delay: 0.5 + i * 0.05,
                        }}
                        className="bg-wds-accent/40 hover:bg-wds-accent/60 flex-1 rounded-t-sm transition-colors"
                      ></motion.div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 rounded-lg border border-white/5 bg-zinc-900/50 p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded bg-zinc-800">
                      <Package className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="h-2 w-20 rounded bg-zinc-800"></div>
                  </div>
                  <div className="h-24 rounded-lg border border-white/5 bg-zinc-900/50 p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded bg-zinc-800">
                      <Users className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="h-2 w-20 rounded bg-zinc-800"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
