'use client';

import { Box } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-wds-background border-t border-white/5 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 md:flex-row">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-white/10 text-white/70">
              <Box className="h-3 w-3" />
            </div>
            <span className="text-sm font-semibold text-white">Savi</span>
          </div>
          <p className="text-xs text-white/70">© 2025 Savi Commerce Inc.</p>
        </div>
        <div className="flex gap-12 text-xs text-white/70">
          <div className="flex flex-col gap-3">
            <span className="font-medium text-white">Product</span>
            <a href="#" className="hover:text-wds-accent transition-colors">
              Changelog
            </a>
            <a href="#" className="hover:text-wds-accent transition-colors">
              Documentation
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-medium text-white">Company</span>
            <a href="#" className="hover:text-wds-accent transition-colors">
              Careers
            </a>
            <a href="#" className="hover:text-wds-accent transition-colors">
              Legal
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-medium text-white">Connect</span>
            <a href="#" className="hover:text-wds-accent transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-wds-accent transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
