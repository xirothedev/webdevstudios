'use client';

import { Box } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary border-t border-white/5 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 md:flex-row">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-zinc-400">
              <Box className="h-3 w-3" />
            </div>
            <span className="text-sm font-semibold text-zinc-200">Savi</span>
          </div>
          <p className="text-xs text-zinc-500">© 2025 Savi Commerce Inc.</p>
        </div>
        <div className="flex gap-12 text-xs text-zinc-500">
          <div className="flex flex-col gap-3">
            <span className="font-medium text-zinc-300">Product</span>
            <a href="#" className="transition-colors hover:text-zinc-300">
              Changelog
            </a>
            <a href="#" className="transition-colors hover:text-zinc-300">
              Documentation
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-medium text-zinc-300">Company</span>
            <a href="#" className="transition-colors hover:text-zinc-300">
              Careers
            </a>
            <a href="#" className="transition-colors hover:text-zinc-300">
              Legal
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-medium text-zinc-300">Connect</span>
            <a href="#" className="transition-colors hover:text-zinc-300">
              Twitter
            </a>
            <a href="#" className="transition-colors hover:text-zinc-300">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
