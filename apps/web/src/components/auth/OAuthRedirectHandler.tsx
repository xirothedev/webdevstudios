'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Component to handle OAuth redirect after page reload
 * Redirects to stored redirect_url or home page (/)
 */
export function OAuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    const redirectUrl = sessionStorage.getItem('oauth_redirect_url');
    sessionStorage.removeItem('oauth_redirect_url');
    router.push(redirectUrl || '/');
  }, [router]);

  return null;
}
