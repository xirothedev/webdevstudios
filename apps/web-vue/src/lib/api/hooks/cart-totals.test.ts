import { test } from 'bun:test';
import assert from 'node:assert';
import { ref } from 'vue';

import { cartTotals } from './use-cart';
import { formatPrice } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/shipping';

import type { Cart } from '@/lib/api/cart';

const cartWith = (totalAmount: number) => ref({ totalAmount } as Cart);

test('below threshold: fee applied', () => {
  const t = cartTotals(cartWith(FREE_SHIPPING_THRESHOLD - 1));
  assert.equal(t.fee.value, SHIPPING_FEE);
  assert.equal(t.total.value, FREE_SHIPPING_THRESHOLD - 1 + SHIPPING_FEE);
  assert.equal(t.isFreeShipping.value, false);
  assert.equal(t.shippingLabel.value, `${formatPrice(SHIPPING_FEE)}₫`);
});

test('at threshold: free shipping', () => {
  const t = cartTotals(cartWith(FREE_SHIPPING_THRESHOLD));
  assert.equal(t.fee.value, 0);
  assert.equal(t.total.value, FREE_SHIPPING_THRESHOLD);
  assert.equal(t.isFreeShipping.value, true);
  assert.equal(t.shippingLabel.value, 'Miễn phí');
});

test('missing cart: zero subtotal, fee still shown', () => {
  const t = cartTotals(ref(undefined));
  assert.equal(t.subtotal.value, 0);
  assert.equal(t.fee.value, SHIPPING_FEE);
  assert.equal(t.totalLabel.value, `${formatPrice(SHIPPING_FEE)}₫`);
});
