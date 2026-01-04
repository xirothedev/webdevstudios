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

import { Loader2 } from 'lucide-react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

interface PageLoadingProps {
  variant?: 'light' | 'dark';
  message?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export function PageLoading({
  variant = 'dark',
  message = 'Đang tải...',
  showNavbar = true,
  showFooter = true,
}: PageLoadingProps) {
  const isLight = variant === 'light';

  return (
    <div
      className={
        isLight
          ? 'min-h-screen bg-white'
          : 'bg-wds-background text-wds-text min-h-screen'
      }
    >
      {showNavbar && <Navbar variant={isLight ? 'light' : 'dark'} />}
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className={`text-wds-accent h-8 w-8 animate-spin ${
              isLight ? 'text-wds-accent' : 'text-wds-accent'
            }`}
          />
          <p
            className={
              isLight ? 'text-sm text-gray-600' : 'text-sm text-white/80'
            }
          >
            {message}
          </p>
        </div>
      </div>
      {showFooter && <Footer variant={isLight ? 'light' : 'dark'} />}
    </div>
  );
}
