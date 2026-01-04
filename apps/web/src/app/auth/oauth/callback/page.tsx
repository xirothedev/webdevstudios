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

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { SITE_URL } from '@/lib/constants';

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const redirectUrl = searchParams.get('redirect_url');

    if (window.opener) {
      const allowedOrigin = new URL(SITE_URL).origin;

      if (error) {
        window.opener.postMessage(
          {
            type: 'oauth-error',
            data: {
              error,
              errorDescription:
                errorDescription || 'OAuth authentication failed',
            },
          },
          allowedOrigin
        );
      } else {
        window.opener.postMessage(
          {
            type: 'oauth-success',
            data: { redirectUrl: redirectUrl || '/' },
          },
          allowedOrigin
        );
      }
    }

    setTimeout(() => window.close(), 100);
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-orange-500" />
        </div>
        <p className="text-sm text-white/70">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}
