/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository on GitHub
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

export const FREE_SHIPPING_THRESHOLD = 500000;
export const SHIPPING_FEE = 30000;

// ponytail: mirrors backend fee rules (NestJS orders.service, Go orders service, Elysia lib/orders) — keep in sync
export function shippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function isFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}
