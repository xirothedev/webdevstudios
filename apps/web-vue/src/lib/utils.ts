// cn lives in @/lib/cn (single cn, T1) — this file carries the rest of apps/web src/lib/utils.ts

/**
 * Format price to Vietnamese currency format
 * @param amount - Price amount in VND
 * @returns Formatted price string (e.g., "1.000.000")
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}
