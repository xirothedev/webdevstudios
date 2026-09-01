import { expect, test } from 'bun:test';

import { nextDisabledFor } from './pagination';

const rowsOf = (n: number) => Array.from({ length: n });

test('total known: next enabled while more pages exist', () => {
  expect(nextDisabledFor(1, 25, rowsOf(10), 10)).toBe(false);
  expect(nextDisabledFor(2, 25, rowsOf(10), 10)).toBe(false);
});

test('total known: next disabled on and past the last page', () => {
  expect(nextDisabledFor(3, 25, rowsOf(5), 10)).toBe(true);
  expect(nextDisabledFor(2, 20, rowsOf(10), 10)).toBe(true); // exact multiple
  expect(nextDisabledFor(1, 0, rowsOf(0), 10)).toBe(true); // empty list
});

test('total unknown: short page disables next, full page enables it', () => {
  expect(nextDisabledFor(1, undefined, rowsOf(10), 10)).toBe(false);
  expect(nextDisabledFor(1, undefined, rowsOf(4), 10)).toBe(true);
  expect(nextDisabledFor(1, undefined, rowsOf(0), 10)).toBe(true);
});
