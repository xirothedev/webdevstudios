'use client';

import { BarChart2, Gem, Layers, Timer } from 'lucide-react';

import { SpotlightCard } from './SpotlightCard';

export function FeaturesGrid() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Engineered for <span className="text-zinc-500">Scale.</span>
          </h2>
          <p className="max-w-lg text-zinc-400">
            Powerful tools designed for premium single-store brands. No clutter,
            just performance.
          </p>
        </div>

        <div className="grid auto-rows-[300px] grid-cols-1 gap-6 md:grid-cols-3">
          {/* Feature 1: Flash Sale Engine (Large) */}
          <SpotlightCard
            colSpan="md:col-span-2"
            className="relative flex flex-col justify-between overflow-hidden"
          >
            <div className="relative z-10">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-indigo-500">
                <Timer className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-zinc-100">
                Flash Sale Engine
              </h3>
              <p className="max-w-sm text-sm text-zinc-500">
                Automated countdowns, inventory reservation, and
                high-concurrency handling for drops.
              </p>
            </div>
            <div className="mask-image-gradient absolute right-0 bottom-0 h-full w-1/2 bg-linear-to-l from-indigo-900/20 to-transparent opacity-50">
              {/* Abstract UI representation */}
              <div className="bg-primary absolute top-1/2 right-[-20px] h-40 w-64 translate-y-12 rounded-tl-xl border border-zinc-800 p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-2 w-20 rounded bg-zinc-800"></div>
                  <div className="flex h-6 w-16 items-center justify-center rounded bg-red-500/20 px-2 text-[10px] text-red-500">
                    00:12:45
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-full rounded border border-zinc-800/50 bg-zinc-900"></div>
                  <div className="h-8 w-full rounded border border-zinc-800/50 bg-zinc-900"></div>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Feature 2: Real-time Inventory */}
          <SpotlightCard className="relative flex flex-col">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-emerald-500">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-zinc-100">
              Real-time Inventory
            </h3>
            <p className="text-sm text-zinc-500">
              Sync stock across all channels instantly. Never oversell again.
            </p>

            <div className="mt-8 flex flex-1 items-end justify-center">
              <div className="relative h-24 w-full">
                <div className="absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-2xl"></div>
                <div className="relative z-10 grid h-full grid-cols-4 items-end gap-2">
                  {[30, 70, 45, 90].map((h, i) => (
                    <div
                      key={i}
                      className="w-full rounded-t-sm border-x border-t border-emerald-500/30 bg-emerald-500/20"
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Feature 3: Signature Collections */}
          <SpotlightCard className="relative flex flex-col">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-violet-500">
              <Gem className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-zinc-100">
              Signature Series
            </h3>
            <p className="text-sm text-zinc-500">
              Curate exclusive drops for VIP members with password protection.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="z-30 ml-0 h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800"></div>
              <div className="z-20 -ml-4 h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800"></div>
              <div className="z-10 -ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[10px] text-zinc-400">
                +4k
              </div>
            </div>
          </SpotlightCard>

          {/* Feature 4: Analytics */}
          <SpotlightCard
            colSpan="md:col-span-2"
            className="flex flex-row items-center gap-8"
          >
            <div className="flex-1">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-blue-500">
                <BarChart2 className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-zinc-100">
                Deep Analytics
              </h3>
              <p className="text-sm text-zinc-500">
                Understand your customer LTV, acquisition channels, and product
                performance in VND.
              </p>
            </div>
            <div className="relative hidden h-full flex-1 sm:block">
              <div className="from-card absolute inset-0 z-10 bg-linear-to-r to-transparent"></div>
              <div className="bg-primary flex h-full w-full scale-90 rotate-3 items-center justify-center rounded-lg border border-zinc-800 opacity-60">
                <BarChart2 className="h-12 w-12 text-zinc-700" />
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
