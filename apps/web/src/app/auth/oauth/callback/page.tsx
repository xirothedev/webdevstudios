'use client';

import { useEffect } from 'react';

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function OAuthCallbackPage() {
  useEffect(() => {
    // This page is loaded in a popup window after OAuth callback
    // Send message to parent window and close popup

    const sendMessage = (
      type: 'oauth-success' | 'oauth-error',
      data?: unknown
    ) => {
      if (window.opener) {
        // Verify origin for security
        const allowedOrigin = new URL(FRONTEND_URL).origin;
        window.opener.postMessage(
          {
            type,
            data,
          },
          allowedOrigin
        );
      }
      // Close popup after sending message
      setTimeout(() => {
        window.close();
      }, 100);
    };

    // Check if there's an error in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    const redirectUrl = urlParams.get('redirect_url');

    if (error) {
      sendMessage('oauth-error', {
        error,
        errorDescription: errorDescription || 'OAuth authentication failed',
      });
      return;
    }

    // If no error, assume success (backend has set cookies)
    // Include redirect_url in the message so parent can redirect after reload
    sendMessage('oauth-success', {
      redirectUrl: redirectUrl || '/',
    });
  }, []);

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
