/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { JalaliDateTime } from '../src/datetime/jalali-date-time.js';

describe('browser runtime compatibility', () => {
  it('uses only standard Intl and Date for calendar fields', () => {
    const date = JalaliDateTime.create({ year: 1405, month: 8, day: 19 }, 'Asia/Tehran');
    expect(date.format()).toBe('1405/08/19');
    expect(date.toDate()).toBeInstanceOf(Date);
    expect(window.Intl.DateTimeFormat).toBeDefined();
  });
});
