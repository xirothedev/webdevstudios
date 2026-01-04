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
