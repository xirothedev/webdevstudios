import { describe, expect, it } from 'bun:test';

import { relativeTime } from './date';

const now = Date.UTC(2026, 8, 1, 12, 0, 0);
const MIN = 6e4,
  HOUR = 36e5,
  DAY = 864e5,
  MONTH = 2592e6,
  YEAR = 31536e6;

describe('relativeTime (vi-VN)', () => {
  it('past minutes', () => expect(relativeTime(new Date(now - 5 * MIN), now)).toBe('5 phút trước'));
  it('future hours', () =>
    expect(relativeTime(new Date(now + 3 * HOUR), now)).toBe('sau 3 giờ nữa'));
  it('past day (numeric auto)', () =>
    expect(relativeTime(new Date(now - DAY), now)).toBe('Hôm qua'));
  it('future 2 days', () => expect(relativeTime(new Date(now + 2 * DAY), now)).toBe('Ngày kia'));
  it('past months stays month below year', () =>
    expect(relativeTime(new Date(now - 11 * MONTH), now)).toBe('11 tháng trước'));
  it('past-year boundary crosses into year', () =>
    expect(relativeTime(new Date(now - YEAR - 1000), now)).toBe('năm ngoái'));
  it('past 2 years', () => expect(relativeTime(new Date(now - 2 * YEAR), now)).toBe('2 năm trước'));
});
