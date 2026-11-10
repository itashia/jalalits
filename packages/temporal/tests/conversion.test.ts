import { Temporal } from '@js-temporal/polyfill';
import { describe, expect, it } from 'vitest';
import {
  fromTemporalInstant,
  fromTemporalPlainDate,
  fromTemporalPlainDateTime,
  fromTemporalZonedDateTime,
  toTemporalInstant,
  toTemporalPlainDate,
  toTemporalPlainDateTime,
  toTemporalZonedDateTime,
} from '../src/index.js';

describe('Temporal adapters', () => {
  it('round trips nanosecond instants without precision loss', () => {
    const instant = Temporal.Instant.from('2026-11-10T12:30:45.123456789Z');
    const jalali = fromTemporalInstant(instant, 'Asia/Tehran');
    expect(toTemporalInstant(jalali, Temporal).epochNanoseconds).toBe(instant.epochNanoseconds);
    expect(jalali.timeZone).toBe('Asia/Tehran');
  });

  it('converts PlainDate and PlainDateTime with explicit wall-time zones', () => {
    const plainDate = Temporal.PlainDate.from('2026-11-10');
    expect(fromTemporalPlainDate(plainDate).format()).toBe('1405/08/19');
    const plainDateTime = Temporal.PlainDateTime.from('2026-11-10T12:30:45.123456789');
    const jalali = fromTemporalPlainDateTime(plainDateTime, 'Asia/Tehran');
    expect(toTemporalPlainDateTime(jalali, Temporal).toString()).toBe(
      '2026-11-10T12:30:45.123456789',
    );
    expect(toTemporalPlainDate(jalali, Temporal).toString()).toBe('2026-11-10');
  });

  it('preserves the instant and timezone of ZonedDateTime', () => {
    const source = Temporal.ZonedDateTime.from('2026-11-10T12:30:45.123456789+03:30[Asia/Tehran]');
    const value = fromTemporalZonedDateTime(source);
    expect(toTemporalZonedDateTime(value, Temporal).epochNanoseconds).toBe(source.epochNanoseconds);
    expect(value.timeZone).toBe('Asia/Tehran');
  });

  it('rejects PlainDate values using a non-ISO calendar', () => {
    expect(() =>
      fromTemporalPlainDate(Temporal.PlainDate.from('2026-11-10[u-ca=persian]')),
    ).toThrow(/unsupported/);
  });
});
