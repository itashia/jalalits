import { describe, expect, it } from 'vitest';
import { JalaliDateTime } from '../src/datetime/jalali-date-time.js';
import { jalali } from '../src/datetime/jalali.js';
import { InvalidDateError } from '../src/errors/invalid-date.js';
import { PersianCalendar } from '../src/calendar/persian-calendar.js';

describe('JalaliDateTime', () => {
  it('provides the jalali() convenience constructor without changing date-time behavior', () => {
    expect(jalali('1405/08/19').format()).toBe('1405/08/19');
    expect(jalali({ year: 1405, month: 8, day: 19 }).format()).toBe('1405/08/19');
    expect(jalali(new Date('2026-11-10T00:00:00Z')).format()).toBe('1405/08/19');
    expect(JalaliDateTime.parse('1405/08/19').format()).toBe('1405/08/19');
  });
  it('parses all supported digit scripts and formats Persian names/digits', () => {
    const date = JalaliDateTime.parse('۱۴۰۵/۰۸/۱۹');
    expect(date.format('Y/m/d')).toBe('1405/08/19');
    expect(date.format('l j F Y', true)).toBe('سه‌شنبه ۱۹ آبان ۱۴۰۵');
    expect(JalaliDateTime.parse('١٤٠٥/٠٨/١٩').format()).toBe('1405/08/19');
  });
  it('parses explicit formats and preserves microseconds', () => {
    const date = JalaliDateTime.parseFormat('Y-m-d H:i:s.u', '۱۴۰۵-۰۸-۱۹ ۱۲:۳۰:۴۵.۱۲۳۴۵۶');
    expect(date.format('Y/m/d H:i:s.u')).toBe('1405/08/19 12:30:45.123456');
    expect(date.format('F l')).toBe('آبان سه‌شنبه');
    expect(date.format('z t L')).toBe('234 30 0');
    expect(date.format('\\Y')).toBe('Y');
  });
  it('rejects malformed inputs and unsupported tokens', () => {
    expect(() => JalaliDateTime.parse('1405/8/19')).toThrow(InvalidDateError);
    expect(() => JalaliDateTime.parse('1400/12/30')).toThrow(InvalidDateError);
    expect(() => JalaliDateTime.parse('1405/08/19').format('c')).toThrow(InvalidDateError);
  });
  it('is immutable and clamps month arithmetic', () => {
    const date = JalaliDateTime.create({ year: 1405, month: 6, day: 31, hour: 10 });
    expect(date.addMonths(1).format()).toBe('1405/07/30');
    expect(date.format()).toBe('1405/06/31');
  });
  it('uses Saturday week boundaries and elapsed seconds', () => {
    const date = JalaliDateTime.parse('1405/08/19');
    expect(date.dayOfWeek()).toBe(3);
    expect(date.startOfWeek().format()).toBe('1405/08/16');
    expect(date.addHours(24).format()).toBe('1405/08/20');
  });
  it('preserves instant across timezone conversion', () => {
    const tehran = JalaliDateTime.create(
      { year: 1405, month: 8, day: 19, hour: 12 },
      'Asia/Tehran',
    );
    expect(tehran.toTimeZone('UTC').epochMilliseconds).toBe(tehran.epochMilliseconds);
    expect(tehran.timeZone).toBe('Asia/Tehran');
  });
  it('preserves local wall time when adding calendar days across daylight saving changes', () => {
    const date = JalaliDateTime.create(
      { ...PersianCalendar.fromGregorian({ year: 2026, month: 10, day: 31 }), hour: 12 },
      'America/New_York',
    );
    const tomorrow = date.addDays(1);
    expect(tomorrow.format('H:i')).toBe('12:00');
    expect(tomorrow.epochMilliseconds - date.epochMilliseconds).toBe(25 * 60 * 60 * 1000);
  });
  it('distinguishes a local day from 24 elapsed hours at the spring transition', () => {
    const date = JalaliDateTime.create(
      { ...PersianCalendar.fromGregorian({ year: 2026, month: 3, day: 7 }), hour: 12 },
      'America/New_York',
    );
    expect(date.addDays(1).epochMilliseconds - date.epochMilliseconds).toBe(23 * 60 * 60 * 1000);
    expect(date.addHours(24).epochMilliseconds - date.epochMilliseconds).toBe(24 * 60 * 60 * 1000);
    expect(date.addDays(1).format('H:i')).toBe('12:00');
  });
  it('rejects nonexistent local wall times', () => {
    const springDay = PersianCalendar.fromGregorian({ year: 2026, month: 3, day: 8 });
    expect(() =>
      JalaliDateTime.create({ ...springDay, hour: 2, minute: 30 }, 'America/New_York'),
    ).toThrow(InvalidDateError);
  });
  it('formats the actual timezone offset', () => {
    const date = JalaliDateTime.create({ year: 1405, month: 8, day: 19, hour: 12 }, 'Asia/Tehran');
    expect(date.format('P O')).toBe('+03:30 +0330');
  });
  it('preserves nanoseconds in instant conversions and date arithmetic', () => {
    const epochNanoseconds = 1_794_312_645_123_456_789n;
    const date = JalaliDateTime.fromEpochNanoseconds(epochNanoseconds, 'UTC');
    expect(date.epochNanoseconds).toBe(epochNanoseconds);
    expect(date.addDays(1).epochNanoseconds - epochNanoseconds).toBe(86_400_000_000_000n);
    expect(JalaliDateTime.fromEpochNanoseconds(-1n).epochNanoseconds).toBe(-1n);
  });
});
