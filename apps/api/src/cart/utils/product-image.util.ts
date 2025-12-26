import { ProductSlug } from 'generated/prisma/client';

/**
 * Map product slug to image URL (hardcoded in frontend)
 * This utility helps backend generate correct image URLs for cart/order items
 */
export function getProductImageUrl(slug: ProductSlug): string {
  const imageMap: Record<ProductSlug, string> = {
    AO_THUN: '/shop/ao-thun.webp',
    PAD_CHUOT: '/shop/pad-chuot.webp',
    DAY_DEO: '/shop/day-deo.webp',
    MOC_KHOA: '/shop/moc-khoa.webp',
  };

  return imageMap[slug] || '/shop/default.webp';
}
