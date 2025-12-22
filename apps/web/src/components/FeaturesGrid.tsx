'use client';

import { Circle, Shirt, ShoppingBag, Star } from 'lucide-react';

import { SpotlightCard } from './SpotlightCard';

export function FeaturesGrid() {
  return (
    <section className="relative py-24">
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

        <div className="grid auto-rows-[300px] grid-cols-1 gap-6 md:grid-cols-3">
          {/* Feature 1: Flash Sale Engine (Large) */}
          <SpotlightCard
            colSpan="md:col-span-2"
            className="relative flex flex-col justify-between overflow-hidden"
          >
            <div className="relative z-10">
              <div className="text-wds-accent mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/50">
                <Shirt className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-white">
                Áo thun WDS
              </h3>
              <p className="max-w-sm text-sm text-white/70">
                Áo thun chất lượng cao với logo WebDev Studios, nhiều màu sắc và
                size đa dạng. Thiết kế độc đáo, phù hợp mọi phong cách.
              </p>
            </div>
            <div className="mask-image-gradient from-wds-accent/20 absolute right-0 bottom-0 h-full w-1/2 bg-linear-to-l to-transparent opacity-50">
              {/* Product mockup */}
              <div className="bg-primary absolute top-1/2 right-[-20px] h-40 w-64 translate-y-12 rounded-tl-xl border border-zinc-800 p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-2 w-20 rounded bg-zinc-800"></div>
                  <div className="bg-wds-accent/20 text-wds-accent flex h-6 w-16 items-center justify-center rounded px-2 text-[10px]">
                    Hot
                  </div>
                </div>
                {/* T-shirt visual */}
                <div className="space-y-2">
                  <div className="bg-wds-accent/10 flex h-16 w-full items-center justify-center rounded border border-zinc-800/50">
                    <Shirt className="text-wds-accent/50 h-8 w-8" />
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-wds-accent/20 h-4 w-8 rounded"></div>
                    <div className="h-4 w-8 rounded bg-zinc-800"></div>
                    <div className="h-4 w-8 rounded bg-zinc-700"></div>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Feature 2: Mũ & Phụ kiện */}
          <SpotlightCard className="relative flex flex-col">
            <div className="text-wds-accent mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
              <Circle className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-white">
              Mũ & Phụ kiện
            </h3>
            <p className="text-sm text-white/70">
              Bộ sưu tập mũ snapback, bucket hat và các phụ kiện khác với logo
              WDS nổi bật.
            </p>

            <div className="mt-8 flex flex-1 items-center justify-center">
              <div className="relative">
                <div className="bg-wds-accent/10 absolute inset-0 top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-center justify-center">
                  {/* Hat visual */}
                  <div className="flex flex-col items-center">
                    <div className="bg-wds-accent/20 border-wds-accent/30 mb-1 h-8 w-16 rounded-t-full border"></div>
                    <div className="bg-wds-accent/10 border-wds-accent/20 h-4 w-12 rounded border"></div>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Feature 3: Túi & Balo */}
          <SpotlightCard className="relative flex flex-col">
            <div className="text-wds-accent mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-white">Túi & Balo</h3>
            <p className="text-sm text-white/70">
              Túi đeo chéo và balo laptop với thiết kế hiện đại, phù hợp cho
              developer và sinh viên IT.
            </p>
            <div className="mt-6 flex flex-1 items-center justify-center">
              <div className="relative">
                <div className="bg-wds-accent/10 absolute inset-0 top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"></div>
                <div className="relative z-10 flex items-center justify-center">
                  <ShoppingBag className="text-wds-accent/60 h-12 w-12" />
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Feature 4: Bộ sưu tập đặc biệt */}
          <SpotlightCard
            colSpan="md:col-span-2"
            className="flex flex-row items-center gap-8"
          >
            <div className="flex-1">
              <div className="text-wds-accent mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-white">
                Bộ sưu tập đặc biệt
              </h3>
              <p className="text-sm text-white/70">
                Các sản phẩm giới hạn và phiên bản đặc biệt chỉ dành cho thành
                viên WebDev Studios. Số lượng có hạn.
              </p>
            </div>
            <div className="relative hidden h-full flex-1 sm:block">
              <div className="from-card absolute inset-0 z-10 bg-linear-to-r to-transparent"></div>
              <div className="bg-primary border-wds-accent/20 flex h-full w-full scale-90 rotate-3 items-center justify-center rounded-lg border opacity-60">
                <div className="flex flex-col items-center gap-2">
                  <Star className="text-wds-accent/60 fill-wds-accent/20 h-12 w-12" />
                  <div className="text-wds-accent/60 text-[10px] font-medium">
                    LIMITED
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
