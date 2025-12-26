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
