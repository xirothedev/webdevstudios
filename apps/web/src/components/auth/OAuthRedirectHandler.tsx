'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Component to handle OAuth redirect after page reload
 * Checks sessionStorage for oauth_redirect_url and redirects if found
 */
export function OAuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    const redirectUrl = sessionStorage.getItem('oauth_redirect_url');
    if (redirectUrl) {
      sessionStorage.removeItem('oauth_redirect_url');
      router.push(redirectUrl);
    }
  }, [router]);

  return null;
}
