import { describe, expect, it } from 'vitest';
import { JalaliDateTime } from 'jalalits';
import {
  fromGregorianDate,
  normalizeFormDateInput,
  parseRequestDate,
  serializeResponseDate,
  toGregorianDate,
  validateApiDate,
} from '../src/index.js';

describe('API date boundaries', () => {
  it('parses strict request values and returns structured validation errors', () => {
    expect(parseRequestDate('۱۴۰۵/۰۸/۱۹').format()).toBe('1405/08/19');
    expect(
      parseRequestDate('1405/08/19 12:30:45.123456', { kind: 'datetime' }).format('H:i:s.u'),
    ).toBe('12:30:45.123456');
    expect(validateApiDate('1405/8/19').success).toBe(false);
  });

  it('serializes date-only and datetime fields with explicit calendar semantics', () => {
    const date = JalaliDateTime.create({ year: 1405, month: 8, day: 19, hour: 12 }, 'Asia/Tehran');
    expect(serializeResponseDate(date, { kind: 'date', calendar: 'jalali' })).toBe('1405/08/19');
    expect(serializeResponseDate(date, { kind: 'date', calendar: 'gregorian' })).toBe('2026-11-10');
    expect(serializeResponseDate(date, { kind: 'datetime' })).toContain('+03:30');
  });

  it('normalizes Persian form digits and converts Gregorian dates explicitly', () => {
    expect(normalizeFormDateInput('۱۴۰۵/۰۸/۱۹')).toBe('1405/08/19');
    expect(normalizeFormDateInput('')).toBe('');
    const jalali = fromGregorianDate({ year: 2026, month: 11, day: 10 });
    expect(jalali.format()).toBe('1405/08/19');
    expect(toGregorianDate(jalali)).toEqual({ year: 2026, month: 11, day: 10 });
  });
});
