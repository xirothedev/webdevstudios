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

import { Check } from 'lucide-react';

interface ProductFeaturesProps {
  features: string[];
  title?: string;
}

export function ProductFeatures({ features, title = 'Đặc điểm nổi bật' }: ProductFeaturesProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-4 text-sm font-semibold tracking-wider text-white/90 uppercase">{title}</h2>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li
            key={index}
            className="animate-in fade-in-0 slide-in-from-left-2 fill-mode-backwards flex items-center gap-3 text-sm text-white/70 duration-300"
            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
          >
            <div className="bg-wds-accent/20 flex h-5 w-5 items-center justify-center rounded-full">
              <Check className="text-wds-accent h-3 w-3" />
            </div>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
