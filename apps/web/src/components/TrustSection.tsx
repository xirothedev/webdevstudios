'use client';

import { RefreshCw, ShieldCheck, Truck, Zap } from 'lucide-react';

export function TrustSection() {
  const brands = [
    { icon: ShieldCheck, text: 'Secure Payment' },
    { icon: Truck, text: 'Global Shipping' },
    { icon: RefreshCw, text: '7-Day Returns' },
    { icon: Zap, text: 'Instant Support' },
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
                <div className="rounded-lg bg-white/5 p-2 text-zinc-500 transition-all duration-300 group-hover:bg-indigo-500/10 group-hover:text-indigo-400">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-zinc-500 transition-colors group-hover:text-zinc-300">
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
