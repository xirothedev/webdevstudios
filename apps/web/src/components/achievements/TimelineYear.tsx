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

import type { AwardItem } from '@/data/achievements';

import { AchievementCard } from './AchievementCard';

interface TimelineYearProps {
  year: number;
  items: AwardItem[];
  isLast?: boolean;
}

export function TimelineYear({
  year,
  items,
  isLast = false,
}: TimelineYearProps) {
  return (
    <div className={`relative mb-16 ${isLast ? 'last:mb-0' : ''}`}>
      {/* Year Marker */}
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-wds-accent relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-black shadow-[0_0_20px_rgba(247,147,30,0.4)]">
          {year}
        </div>
        <div className="from-wds-accent/50 h-px flex-1 bg-linear-to-r to-transparent" />
      </div>

      {/* Connecting Line (Desktop) */}
      {!isLast && (
        <div className="from-wds-accent/30 absolute top-16 bottom-[-64px] left-8 hidden w-px bg-linear-to-b to-transparent md:block" />
      )}

      {/* Awards Grid */}
      <div className="grid grid-cols-1 gap-6 md:pl-24 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <AchievementCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
