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

import { AuthFooter } from './AuthFooter';
import { AuthHeader } from './AuthHeader';
import { AuthSocialButtons } from './AuthSocialButtons';
import { AuthWelcome } from './AuthWelcome';

interface AuthLayoutProps {
  children: React.ReactNode;
  variant?: 'login' | 'signup';
}

export function AuthLayout({ children, variant = 'login' }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Orange blob */}
        <div className="blob animate-blob-1 absolute top-[10%] -left-[30%] h-[500px] w-[500px] rounded-full bg-orange-600/40 blur-[120px]" />
        {/* Amber blob */}
        <div className="blob animate-blob-2 absolute -right-[30%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-amber-600/40 blur-[120px]" />
        {/* Yellow accent blob */}
        <div className="blob animate-blob-3 absolute bottom-[-10%] left-[20%] h-[400px] w-[400px] rounded-full bg-yellow-600/30 blur-[100px]" />
        {/* Red-orange accent blob */}
        <div className="blob animate-blob-4 absolute top-[-10%] right-[20%] h-[400px] w-[400px] rounded-full bg-red-500/30 blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px]" />

      <AuthHeader />

      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-[520px] space-y-8">
          <AuthWelcome />
          <AuthSocialButtons />
          {children}
          <AuthFooter variant={variant} />
        </div>
      </main>
    </div>
  );
}
