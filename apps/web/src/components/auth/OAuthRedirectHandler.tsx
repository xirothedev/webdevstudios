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

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Component to handle OAuth redirect after page reload
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
