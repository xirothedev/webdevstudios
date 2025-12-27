'use client';

import { useEffect } from 'react';

import { getCsrfToken } from '@/lib/csrf';

/**
 * CSRF Token Initializer
 * Prefetches CSRF token when app loads to ensure it's available for requests
 */
export function CsrfInitializer() {
  useEffect(() => {
    // Prefetch CSRF token on mount
    // This ensures token is available before first state-changing request
    getCsrfToken().catch((error) => {
      // Silently fail - token will be fetched on-demand if needed
      console.warn('Failed to prefetch CSRF token:', error);
    });
  }, []);

  return null; // This component doesn't render anything
}
