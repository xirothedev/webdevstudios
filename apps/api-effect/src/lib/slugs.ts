import type { ProductSlug } from '../generated/prisma/client';

export const VALID_SLUGS = ['AO_THUN', 'PAD_CHUOT', 'DAY_DEO', 'MOC_KHOA'] as const;

// Checked conversion of a validated slug against the Prisma enum.
export const isProductSlug = (s: string): s is ProductSlug =>
  (VALID_SLUGS as readonly string[]).includes(s);
