'use client';

import { ArrowRight, Crown } from 'lucide-react';
import Link from 'next/link';

import { AchievementHero } from '@/components/achievements/AchievementHero';
import { AchievementSection } from '@/components/achievements/AchievementSection';
import { TimelineYear } from '@/components/achievements/TimelineYear';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { AWARDS } from '@/data/achievements';

export default function AchievementsPage() {
  return (
    <div className="selection:bg-wds-accent min-h-screen bg-black font-sans text-white selection:text-black">
      <Navbar variant="dark" />

      {/* --- BACKGROUND EFFECTS --- */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Retro Grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />

        {/* Ambient Glow */}
        <div className="bg-wds-accent/15 absolute top-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full opacity-50 blur-[120px]" />
      </div>

      <main className="relative z-10 pt-32 pb-20">
        {/* --- HERO SECTION --- */}
        <AchievementHero />

        {/* --- AWARDS TIMELINE --- */}
        <section className="mx-auto mb-32 max-w-6xl px-6">
          <AchievementSection
            label="Chặng đường phát triển"
            title="Dấu Ấn Rực Rỡ"
          />

          <div className="relative">
            {AWARDS.map((yearGroup, index) => (
              <TimelineYear
                key={yearGroup.year}
                year={yearGroup.year}
                items={yearGroup.items}
                isLast={index === AWARDS.length - 1}
              />
            ))}
          </div>
        </section>

        {/* --- RECOGNITION BANNER --- */}
        <section className="px-6">
          <div className="mx-auto max-w-5xl">
            <div className="group border-wds-accent/30 from-wds-accent/10 relative overflow-hidden rounded-3xl border bg-linear-to-br to-black px-6 py-16 text-center md:px-20 md:py-20">
              {/* Animated Glow */}
              <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_50%,rgba(247,147,30,0.1),transparent_50%)]" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-wds-accent/20 ring-wds-accent/50 mb-6 rounded-full p-4 ring-1">
                  <Crown size={40} className="text-wds-accent" />
                </div>

                <h2 className="mb-6 text-3xl font-bold text-balance text-white sm:text-4xl">
                  Viết tiếp câu chuyện thành công
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-pretty text-gray-400">
                  Mỗi giải thưởng là một cột mốc, nhưng con người mới là di sản
                  lớn nhất. Bạn đã sẵn sàng để cùng WDS chinh phục những đỉnh
                  cao tiếp theo?
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/contact"
                    className="group bg-wds-accent flex h-12 items-center justify-center gap-2 rounded-full px-8 text-sm font-semibold text-black transition hover:bg-white hover:shadow-[0_0_20px_rgba(247,147,30,0.4)]"
                  >
                    Đăng ký tuyển quân{' '}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="dark" />
    </div>
  );
}
