import type { Metadata } from 'next';

import { createPageMetadata } from '@/lib/metadata';

export function createAdminPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const baseMetadata = createPageMetadata({
    title,
    description,
    path,
  });

  return {
    ...baseMetadata,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}
