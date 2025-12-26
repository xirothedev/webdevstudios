import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price to Vietnamese currency format
 * @param amount - Price amount in VND
 * @returns Formatted price string (e.g., "1.000.000")
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}
