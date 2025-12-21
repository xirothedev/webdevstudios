'use client';

import { Box, ChevronRight } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="glass fixed top-0 right-0 left-0 z-50 border-b border-white/5">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="group flex cursor-pointer items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500 text-black">
            <Box className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            Savi
          </span>
        </div>

        <div className="hidden items-center gap-8 text-xs font-medium text-zinc-400 md:flex">
          <a href="#" className="transition-colors hover:text-zinc-100">
            Collections
          </a>
          <a href="#" className="transition-colors hover:text-zinc-100">
            Analytics
          </a>
          <a href="#" className="transition-colors hover:text-zinc-100">
            Inventory
          </a>
          <a href="#" className="transition-colors hover:text-zinc-100">
            Customers
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100 sm:block">
            Log in
          </button>
          <button className="relative inline-flex h-8 overflow-hidden rounded-full p-px focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 focus:outline-none">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#312E81_50%,#E2E8F0_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white backdrop-blur-3xl transition-colors hover:bg-slate-950/90">
              Start Trial
              <ChevronRight className="ml-1 h-3 w-3" />
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
