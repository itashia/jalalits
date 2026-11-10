import { describe, expect, expectTypeOf, it } from 'vitest';
import { JalaliDateTime } from 'jalalits';
import { z } from 'zod';
import { zJalaliDate, zJalaliDateTime, zJalaliRange } from '../src/index.js';

describe('Zod Jalali schemas', () => {
  it('transforms valid dates and enforces inclusive bounds', () => {
    const schema = zJalaliDate({ min: '1300/01/01', max: '1500/12/29' });
    expect(schema.parse('۱۴۰۵/۰۸/۱۹')).toBeInstanceOf(JalaliDateTime);
    expect(schema.safeParse('1200/01/01').success).toBe(false);
    expect(schema.safeParse('1400/12/30').success).toBe(false);
  });

  it('validates configuration immediately and supports Persian errors', () => {
    expect(() => zJalaliDate({ min: '1400/12/30' })).toThrow(/minimum constraint/);
    expect(() => zJalaliDate({ min: '1405/01/01', max: '1404/12/29' })).toThrow(
      /must not be after/,
    );
    const result = zJalaliDate({ locale: 'fa' }).safeParse('1400/12/30');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toContain('تاریخ جلالی معتبر');
  });

  it('parses date-times and validates inclusive range ordering', () => {
    const datetime = zJalaliDateTime().parse('1405/08/19 12:30:45.123456');
    expect(datetime.format('H:i:s.u')).toBe('12:30:45.123456');
    const range = zJalaliRange().parse({ start: '1405/08/19', end: '1405/08/20' });
    expect(range.start).toBeInstanceOf(JalaliDateTime);
    expect(zJalaliRange().safeParse({ start: '1405/08/20', end: '1405/08/19' }).success).toBe(
      false,
    );
  });

  it('preserves input and output inference', () => {
    const schema = zJalaliDate();
    expect(schema).toBeDefined();
    expectTypeOf<z.input<typeof schema>>().toEqualTypeOf<string>();
    expectTypeOf<z.output<typeof schema>>().toEqualTypeOf<JalaliDateTime>();
  });
});
