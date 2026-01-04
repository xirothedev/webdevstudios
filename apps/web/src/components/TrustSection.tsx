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

import { RefreshCw, ShieldCheck, Truck, Zap } from 'lucide-react';

export function TrustSection() {
  const brands = [
    { icon: ShieldCheck, text: 'Thanh toán an toàn' },
    { icon: Truck, text: 'Giao hàng nhanh chóng' },
    { icon: RefreshCw, text: 'Đổi trả trong 7 ngày' },
    { icon: Zap, text: 'Hỗ trợ 24/7' },
  ];

  return (
    <section className="border-y border-white/5 bg-black/20 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:justify-between md:gap-4">
          {brands.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group flex cursor-default items-center gap-3"
              >
                <div className="group-hover:bg-wds-accent/10 group-hover:text-wds-accent rounded-lg bg-white/5 p-2 text-white/70 transition-all duration-300">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <span className="group-hover:text-wds-accent text-sm font-medium text-white/70 transition-colors">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
