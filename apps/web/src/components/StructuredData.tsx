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

import { getOrganizationSchema, getWebSiteSchema } from '@/lib/structured-data';

export function StructuredData() {
  useEffect(() => {
    // Add organization schema
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.text = JSON.stringify(getOrganizationSchema());
    orgScript.id = 'organization-schema';
    document.head.appendChild(orgScript);

    // Add website schema
    const webScript = document.createElement('script');
    webScript.type = 'application/ld+json';
    webScript.text = JSON.stringify(getWebSiteSchema());
    webScript.id = 'website-schema';
    document.head.appendChild(webScript);

    return () => {
      // Cleanup
      const orgEl = document.getElementById('organization-schema');
      const webEl = document.getElementById('website-schema');
      if (orgEl) orgEl.remove();
      if (webEl) webEl.remove();
    };
  }, []);

  return null;
}
