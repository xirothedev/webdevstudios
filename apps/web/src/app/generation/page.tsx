'use client';

import {
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Crown,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { type Generation, generations, getInitials } from '@/data/generations';

// Expandable Generation Section for Mobile
function ExpandableGenerationSection({
  generation,
}: {
  generation: Generation;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section className="relative">
      {/* Generation Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="from-wds-accent via-wds-accent/90 to-wds-accent/70 shadow-wds-accent/30 hover:shadow-wds-accent/40 relative w-full overflow-hidden rounded-2xl bg-linear-to-r p-4 text-black shadow-lg transition-all duration-300 active:scale-[0.99] sm:p-6"
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 h-20 w-20 animate-pulse rounded-full bg-white/20" />
          <div className="absolute right-1/4 bottom-0 h-16 w-16 animate-pulse rounded-full bg-white/10 delay-300" />
        </div>

        <div className="relative z-10 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/20 sm:h-12 sm:w-12">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black sm:text-xl">
                  Generation {generation.gen}
                </h2>
                <span className="hidden rounded-full bg-black/20 px-3 py-1 text-xs font-bold uppercase sm:inline-block">
                  {generation.period}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold opacity-80 sm:hidden">
                {generation.period}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              <span>{generation.members.length}</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 transition-transform duration-300" />
            ) : (
              <ChevronDown className="h-5 w-5 transition-transform duration-300" />
            )}
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      <div
        className={`mt-4 grid grid-cols-1 gap-3 overflow-hidden transition-all duration-500 ease-out sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 ${
          isExpanded ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Leaders first - highlight with larger cards */}
        {generation.members
          .filter((m) => m.isLeader)
          .map((member) => (
            <article
              key={member.id}
              className="group hover:border-wds-accent/60 hover:shadow-wds-accent/20 relative flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 sm:p-6"
            >
              {/* Shimmer effect on hover */}
              <div className="via-wds-accent/10 absolute inset-0 rounded-2xl bg-linear-to-r from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Avatar */}
              <div className="relative">
                {member.avatar ? (
                  <div className="from-wds-accent to-wds-accent/70 shadow-wds-accent/30 group-hover:shadow-wds-accent/50 overflow-hidden rounded-full bg-linear-to-br shadow-lg transition-shadow">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={120}
                      height={120}
                      className="h-20 w-20 object-cover transition-transform duration-300 group-hover:scale-110 sm:h-28 sm:w-28"
                    />
                  </div>
                ) : (
                  <div className="from-wds-accent to-wds-accent/70 shadow-wds-accent/30 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br text-lg font-black text-black shadow-lg sm:h-28 sm:w-28 sm:text-2xl">
                    {getInitials(member.name)}
                  </div>
                )}
                {/* Crown badge for leaders */}
                <div className="text-wds-accent absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-black shadow-lg sm:h-7 sm:w-7">
                  <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>
              </div>

              {/* Member info */}
              <div className="relative z-10 flex flex-col items-center gap-1 text-center">
                <h3 className="group-hover:text-wds-accent text-sm leading-snug font-bold text-black transition-colors sm:text-base">
                  {member.name}
                </h3>
                <p className="text-wds-accent line-clamp-2 text-[10px] font-bold tracking-wider uppercase sm:text-xs">
                  {member.role}
                </p>
              </div>
            </article>
          ))}

        {/* Other members */}
        {generation.members
          .filter((m) => !m.isLeader)
          .map((member) => (
            <article
              key={member.id}
              className="group hover:border-wds-accent/60 hover:shadow-wds-accent/20 relative flex flex-col items-center gap-2 rounded-xl border border-gray-200/50 bg-white/80 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white sm:gap-3 sm:p-4"
            >
              {/* Avatar */}
              {member.avatar ? (
                <div className="bg-wds-accent/20 overflow-hidden rounded-full">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={64}
                    height={64}
                    sizes="(max-width: 768px) 144px, 288px"
                    className="h-14 w-14 object-cover transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20"
                  />
                </div>
              ) : (
                <div className="bg-wds-accent/20 text-wds-accent flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold sm:h-20 sm:w-20 sm:text-base">
                  {getInitials(member.name)}
                </div>
              )}

              {/* Member info */}
              <div className="flex flex-col items-center gap-0.5 text-center sm:gap-1">
                <h3 className="group-hover:text-wds-accent text-xs leading-snug font-semibold text-black transition-colors sm:text-sm">
                  {member.name}
                </h3>
                <p className="line-clamp-2 text-[9px] font-medium tracking-wide text-gray-500 uppercase sm:text-[10px]">
                  {member.role}
                </p>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}

// Desktop Bento Grid (original layout for larger screens)
function DesktopBentoGrid({ generation }: { generation: Generation }) {
  const [leader1, leader2, leader3, ...members] = generation.members;

  return (
    <section className="hidden lg:block">
      {/* Bento Grid */}
      <div className="grid auto-rows-[200px] grid-cols-4 gap-4">
        {/* Generation Info Card - spans 1 column, 2 rows */}
        <div className="row-span-2">
          <div className="from-wds-accent to-wds-accent/90 shadow-wds-accent/30 group hover:shadow-wds-accent/50 relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-linear-to-br p-6 text-black shadow-lg transition-all duration-300">
            {/* Decorative background elements */}
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
            <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-white/10 transition-transform delay-100 duration-500 group-hover:scale-125" />
            <div className="absolute top-1/2 right-8 -translate-y-1/2">
              <Sparkles className="h-24 w-24 text-white/20 transition-transform duration-500 group-hover:rotate-12" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/20">
                  <Crown className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold tracking-widest text-black/80 uppercase">
                  Generation {generation.gen}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-black/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{generation.period}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{generation.members.length} thành viên</span>
                </div>
              </div>
            </div>

            {/* Bottom decoration */}
            <div className="relative z-10 flex items-center gap-2 text-black/70">
              <Award className="h-5 w-5" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Leader team
              </span>
            </div>
          </div>
        </div>

        {/* 3 Leader Cards - each spans 1 column, 2 rows */}
        {leader1 && (
          <div className="row-span-2">
            <article className="hover:border-wds-accent/60 hover:shadow-wds-accent/20 group relative flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1">
              {/* Hover gradient overlay */}
              <div className="from-wds-accent/0 to-wds-accent/5 absolute inset-0 rounded-2xl bg-linear-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Avatar */}
              <div className="relative">
                {leader1.avatar ? (
                  <div className="from-wds-accent to-wds-accent/70 shadow-wds-accent/30 group-hover:shadow-wds-accent/50 overflow-hidden rounded-full bg-linear-to-br shadow-lg transition-all duration-300">
                    <Image
                      src={leader1.avatar}
                      alt={leader1.name}
                      width={160}
                      height={160}
                      className="h-40 w-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="from-wds-accent to-wds-accent/70 shadow-wds-accent/30 flex h-40 w-40 items-center justify-center rounded-full bg-linear-to-br text-2xl font-black text-black shadow-lg">
                    {getInitials(leader1.name)}
                  </div>
                )}
                {leader1.isLeader && (
                  <div className="text-wds-accent absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black">
                    <Crown className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Member info */}
              <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                <h3 className="group-hover:text-wds-accent text-lg leading-tight font-bold text-black transition-colors">
                  {leader1.name}
                </h3>
                <p className="text-wds-accent text-xs font-bold tracking-wider uppercase">
                  {leader1.role}
                </p>
              </div>
            </article>
          </div>
        )}
        {leader2 && (
          <div className="row-span-2">
            <article className="hover:border-wds-accent/60 hover:shadow-wds-accent/20 group relative flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="from-wds-accent/0 to-wds-accent/5 absolute inset-0 rounded-2xl bg-linear-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                {leader2.avatar ? (
                  <div className="from-wds-accent to-wds-accent/70 shadow-wds-accent/30 group-hover:shadow-wds-accent/50 overflow-hidden rounded-full bg-linear-to-br shadow-lg transition-all duration-300">
                    <Image
                      src={leader2.avatar}
                      alt={leader2.name}
                      width={160}
                      height={160}
                      className="h-40 w-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="from-wds-accent to-wds-accent/70 shadow-wds-accent/30 flex h-40 w-40 items-center justify-center rounded-full bg-linear-to-br text-2xl font-black text-black shadow-lg">
                    {getInitials(leader2.name)}
                  </div>
                )}
                {leader2.isLeader && (
                  <div className="text-wds-accent absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black">
                    <Crown className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                <h3 className="group-hover:text-wds-accent text-lg leading-tight font-bold text-black transition-colors">
                  {leader2.name}
                </h3>
                <p className="text-wds-accent text-xs font-bold tracking-wider uppercase">
                  {leader2.role}
                </p>
              </div>
            </article>
          </div>
        )}
        {leader3 && (
          <div className="row-span-2">
            <article className="hover:border-wds-accent/60 hover:shadow-wds-accent/20 group relative flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="from-wds-accent/0 to-wds-accent/5 absolute inset-0 rounded-2xl bg-linear-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                {leader3.avatar ? (
                  <div className="from-wds-accent to-wds-accent/70 shadow-wds-accent/30 group-hover:shadow-wds-accent/50 overflow-hidden rounded-full bg-linear-to-br shadow-lg transition-all duration-300">
                    <Image
                      src={leader3.avatar}
                      alt={leader3.name}
                      width={160}
                      height={160}
                      className="h-40 w-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="from-wds-accent to-wds-accent/70 shadow-wds-accent/30 flex h-40 w-40 items-center justify-center rounded-full bg-linear-to-br text-2xl font-black text-black shadow-lg">
                    {getInitials(leader3.name)}
                  </div>
                )}
                {leader3.isLeader && (
                  <div className="text-wds-accent absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black">
                    <Crown className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                <h3 className="group-hover:text-wds-accent text-lg leading-tight font-bold text-black transition-colors">
                  {leader3.name}
                </h3>
                <p className="text-wds-accent text-xs font-bold tracking-wider uppercase">
                  {leader3.role}
                </p>
              </div>
            </article>
          </div>
        )}

        {/* Other Members - 1x1 cards */}
        {members.map((member) => (
          <div key={member.id} className="row-span-1">
            <article className="hover:border-wds-accent/60 hover:shadow-wds-accent/20 group relative flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5">
              {member.avatar ? (
                <div className="bg-wds-accent/20 overflow-hidden rounded-full">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={64}
                    height={64}
                    sizes="(max-width: 768px) 144px, 288px"
                    className="h-28 w-28 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="bg-wds-accent/20 text-wds-accent flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold">
                  {getInitials(member.name)}
                </div>
              )}
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="group-hover:text-wds-accent text-sm leading-snug font-semibold text-black transition-colors">
                  {member.name}
                </h3>
                <p className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">
                  {member.role}
                </p>
              </div>
            </article>
          </div>
        ))}
      </div>

      {/* Generation divider */}
      <div className="mt-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
        <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Gen {generation.gen}
        </span>
        <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
      </div>
    </section>
  );
}

export default function GenerationPage() {
  const [starPositions, setStarPositions] = useState<
    Array<{
      left: number;
      top: number;
      delay: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    // Generate random positions only on client side
    setStarPositions(
      Array.from({ length: 6 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 4,
      }))
    );
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="light" />

      {/* Hero Section with animated background */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-32">
        {/* Animated gradient background */}
        <div className="via-wds-secondary/10 to-wds-secondary/20 absolute inset-0 bg-linear-to-b from-white" />

        {/* Floating stars animation */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {starPositions.map((star, i) => (
            <div
              key={i}
              className="animate-float absolute"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            >
              <Star
                className={`h-4 w-4 ${i % 2 === 0 ? 'text-wds-accent/30' : 'text-wds-accent/20'}`}
              />
            </div>
          ))}
        </div>

        {/* Retro grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="retro-grid" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          {/* Section header */}
          <div className="mb-12 flex flex-col gap-4 text-center sm:mb-16 sm:gap-6">
            <div className="inline-flex items-center justify-center gap-2">
              <Users className="text-wds-accent h-5 w-5" />
              <span className="text-wds-accent text-sm font-bold tracking-widest uppercase">
                Di sản của chúng tôi
              </span>
            </div>
            <h1 className="text-3xl leading-tight font-black text-balance sm:text-4xl lg:text-5xl xl:text-6xl">
              Các thế hệ{' '}
              <span className="text-wds-accent relative inline-block">
                Lãnh đạo
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 228 62"
                  fill="none"
                  preserveAspectRatio="none"
                  style={{ height: '16px' }}
                >
                  <path
                    d="M2.16113 4.12184C32.9272 3.15566 210.477 0.901249 224.787 4.12184C242.674 8.14757 50.4565 15.877 40.7974 18.7755C33.0701 21.0943 191.766 26.3439 201.067 26.988C210.369 27.6321 90.5241 37.8414 91.9551 59.999"
                    stroke="#F7931E"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mx-auto max-w-2xl px-4 text-sm text-pretty text-gray-600 sm:text-base">
              Khám phá hành trình của WebDev Studios qua các thế hệ lãnh đạo tận
              tụy đã kiến tạo cộng đồng của chúng tôi.
            </p>
          </div>
        </div>
      </section>

      {/* Generation Sections */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          {/* Mobile/Tablet: Expandable sections */}
          <div className="flex flex-col gap-6 lg:hidden">
            {generations.map((gen) => (
              <ExpandableGenerationSection key={gen.gen} generation={gen} />
            ))}
          </div>

          {/* Desktop: Bento grid layout */}
          <div className="hidden flex-col gap-8 lg:flex">
            {generations.map((gen) => (
              <DesktopBentoGrid key={gen.gen} generation={gen} />
            ))}
          </div>
        </div>
      </section>

      <Footer variant="light" />

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .retro-grid {
          background-size: 40px 40px;
          background-image:
            linear-gradient(
              to right,
              rgba(247, 147, 30, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(247, 147, 30, 0.05) 1px,
              transparent 1px
            );
          mask-image: radial-gradient(
            ellipse 60% 50% at 50% 0%,
            #000 70%,
            transparent 100%
          );
          -webkit-mask-image: radial-gradient(
            ellipse 60% 50% at 50% 0%,
            #000 70%,
            transparent 100%
          );
        }
      `}</style>
    </div>
  );
}
