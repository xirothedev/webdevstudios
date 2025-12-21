'use client';

import { motion } from 'framer-motion';
import { Package, Users } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      {/* Retro Grid Background */}
      <div className="retro-grid pointer-events-none absolute inset-0 z-0 opacity-40"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
          <span className="text-[10px] font-medium tracking-wider text-zinc-300 uppercase">
            SaviOS 2.0 is live
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 bg-linear-to-b from-white to-white/60 bg-clip-text text-5xl leading-[1.1] font-semibold tracking-tight text-transparent md:text-7xl"
        >
          The new standard for <br />
          modern commerce.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-12 max-w-xl text-lg text-zinc-500"
        >
          Crafted for high-end lifestyle brands. Manage real-time inventory,
          global shipping, and exclusive collections with a single robust OS.
        </motion.p>

        {/* 3D Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 15 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="group relative mx-auto max-w-4xl perspective-distant"
        >
          {/* Glow behind */}
          <div className="absolute top-1/2 left-1/2 h-[50%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[100px]"></div>

          {/* Main Interface */}
          <div className="tilt-card bg-card relative z-10 transform-gpu overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            {/* Border Beam Effect */}
            <div className="pointer-events-none absolute inset-0 z-20">
              <div className="absolute top-0 left-1/4 h-px w-1/2 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-50 blur-sm"></div>
            </div>

            {/* Mockup Header */}
            <div className="flex h-10 items-center gap-2 border-b border-white/5 bg-[#161719] px-4">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
              </div>
              <div className="flex-1 text-center font-mono text-[10px] text-zinc-600">
                savi.store/dashboard
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
                      Total Revenue
                    </div>
                    <div className="text-2xl font-medium tracking-tight text-white">
                      ₫ 124,500,000
                    </div>
                  </div>
                  <div className="flex h-8 w-24 items-center justify-center rounded-md border border-indigo-500/20 bg-indigo-500/10 text-xs text-indigo-400">
                    +12.5%
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="relative flex h-48 w-full items-end gap-2 overflow-hidden rounded-lg border border-white/5 bg-linear-to-b from-indigo-500/5 to-transparent px-4 pb-2">
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
                        className="flex-1 rounded-t-sm bg-indigo-500/40 transition-colors hover:bg-indigo-500/60"
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
