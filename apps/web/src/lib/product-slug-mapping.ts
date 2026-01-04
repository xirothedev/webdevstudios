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

// Map frontend URL slugs to backend ProductSlug enums
export const URL_SLUG_TO_BACKEND_SLUG: Record<
  string,
  'AO_THUN' | 'PAD_CHUOT' | 'DAY_DEO' | 'MOC_KHOA'
> = {
  'ao-thun': 'AO_THUN',
  'pad-chuot': 'PAD_CHUOT',
  'day-deo': 'DAY_DEO',
  'moc-khoa': 'MOC_KHOA',
};

export const getBackendSlug = (
  urlSlug: string
): 'AO_THUN' | 'PAD_CHUOT' | 'DAY_DEO' | 'MOC_KHOA' => {
  const backendSlug = URL_SLUG_TO_BACKEND_SLUG[urlSlug];
  if (!backendSlug) {
    throw new Error(`Invalid product slug: ${urlSlug}`);
  }
  return backendSlug;
};
