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

import { BriefcaseBusiness, Layers3, Timer, Users } from 'lucide-react';

import { NumberTicker } from '@/components/ui/number-ticker';

export function WDSStatsSection() {
  return (
    <section className="bg-white py-20 sm:py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <div className="reveal">
          <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-5xl">
            Đôi điều về chúng tôi
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-gray-700 sm:text-lg">
            Được thành lập năm 2018 với hơn 20 thành viên, WebDev Studios đã phát triển thành một
            trong những câu lạc bộ phát triển mạnh mẽ tại trường Đại học Công nghệ Thông tin – ĐHQG
            TP.HCM.
          </p>
        </div>

        <div className="reveal mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <StatItem icon={Layers3} label="Hơn 10 dự án lớn" value={10} suffix="+" />
          <StatItem icon={Timer} label="Hơn 2 năm kinh nghiệm" value={2} suffix="+" />
          <StatItem icon={Users} label="Hơn 45 thành viên" value={45} suffix="+" />
          <StatItem icon={BriefcaseBusiness} label="4 vị trí để ứng tuyển" value={4} />
        </div>
      </div>
    </section>
  );
}

interface StatItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
  suffix?: string;
}

function StatItem({ icon: Icon, label, value, suffix }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-wds-accent flex h-32 w-32 items-center justify-center rounded-full shadow-[0_18px_40px_rgba(0,0,0,0.08)] sm:h-36 sm:w-36">
        <div className="flex flex-col items-center justify-center gap-1">
          <Icon className="h-8 w-8 text-black" />
          <div className="flex items-baseline gap-1 text-3xl font-semibold text-black sm:text-4xl">
            <NumberTicker value={value} className="text-3xl sm:text-4xl" />
            {suffix ? <span>{suffix}</span> : null}
          </div>
        </div>
      </div>
      <p className="max-w-xs text-sm font-medium text-gray-800 sm:text-base">{label}</p>
    </div>
  );
}
