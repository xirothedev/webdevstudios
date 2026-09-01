import { test } from 'bun:test';
import assert from 'node:assert';

const store = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
});

const { usePendingOrder } = await import('./use-pending-order');

test('remember/id round-trip and clearFor removes both keys', () => {
  const po = usePendingOrder();
  assert.equal(po.id(), null);

  po.remember('order-1');
  po.savePaymentUrl('order-1', 'https://pay.example/1');
  assert.equal(po.id(), 'order-1');
  assert.equal(po.paymentUrl('order-1'), 'https://pay.example/1');
  assert.equal(store.get('pendingOrderId'), 'order-1');
  assert.equal(store.get('paymentUrl_order-1'), 'https://pay.example/1');

  po.clearFor('order-1');
  assert.equal(po.id(), null);
  assert.equal(po.paymentUrl('order-1'), null);
});

test('clearFor only drops the given order payment url', () => {
  const po = usePendingOrder();
  po.remember('a');
  po.savePaymentUrl('a', 'url-a');
  po.savePaymentUrl('b', 'url-b');
  po.clearFor('a');
  assert.equal(po.paymentUrl('b'), 'url-b');
  assert.equal(po.id(), null);
});
