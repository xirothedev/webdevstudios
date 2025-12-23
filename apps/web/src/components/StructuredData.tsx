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
