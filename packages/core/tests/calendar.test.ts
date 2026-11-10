import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { PersianCalendar } from '../src/calendar/persian-calendar.js';
import { InvalidDateError } from '../src/errors/invalid-date.js';

describe('PersianCalendar', () => {
  it('converts reference Nowruz and current date anchors in both directions', () => {
    expect(PersianCalendar.toGregorian({ year: 1395, month: 1, day: 1 })).toEqual({
      year: 2016,
      month: 3,
      day: 20,
    });
    expect(PersianCalendar.toGregorian({ year: 1403, month: 1, day: 1 })).toEqual({
      year: 2024,
      month: 3,
      day: 20,
    });
    expect(PersianCalendar.toGregorian({ year: 1404, month: 1, day: 1 })).toEqual({
      year: 2025,
      month: 3,
      day: 21,
    });
    expect(PersianCalendar.toGregorian({ year: 1405, month: 1, day: 1 })).toEqual({
      year: 2026,
      month: 3,
      day: 21,
    });
    expect(PersianCalendar.fromGregorian({ year: 2026, month: 11, day: 10 })).toEqual({
      year: 1405,
      month: 8,
      day: 19,
    });
    expect(
      PersianCalendar.fromGregorian(PersianCalendar.toGregorian({ year: 1, month: 1, day: 1 })),
    ).toEqual({ year: 1, month: 1, day: 1 });
  });
  it('round trips year boundaries throughout the supported range', () => {
    for (let year = 1; year <= 3177; year++) {
      const endMonthDay = PersianCalendar.daysInMonth(year, 12);
      for (const fields of [
        { year, month: 1, day: 1 },
        { year, month: 12, day: endMonthDay },
      ]) {
        expect(PersianCalendar.fromGregorian(PersianCalendar.toGregorian(fields))).toEqual(fields);
      }
    }
  });
  it('round trips every day in a deterministic 200-year sample', () => {
    for (let year = 1300; year < 1500; year++) {
      for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= PersianCalendar.daysInMonth(year, month); day++) {
          const fields = { year, month, day };
          expect(PersianCalendar.fromGregorian(PersianCalendar.toGregorian(fields))).toEqual(
            fields,
          );
        }
      }
    }
  });
  it('property-checks valid dates across the complete supported year range', () => {
    const dates = fc.integer({ min: 1, max: 3177 }).chain((year) =>
      fc.integer({ min: 1, max: 12 }).chain((month) =>
        fc.integer({ min: 1, max: PersianCalendar.daysInMonth(year, month) }).map((day) => ({
          year,
          month,
          day,
        })),
      ),
    );
    fc.assert(
      fc.property(dates, (fields) => {
        expect(PersianCalendar.fromGregorian(PersianCalendar.toGregorian(fields))).toEqual(fields);
      }),
      { seed: 20261110, numRuns: 1_500 },
    );
  });
  it('uses the reference break-year leap model and validates the supported range', () => {
    expect(PersianCalendar.isLeapYear(1403)).toBe(true);
    expect(PersianCalendar.daysInMonth(1403, 12)).toBe(30);
    expect(() => PersianCalendar.daysInMonth(0, 1)).toThrow(InvalidDateError);
    expect(() => PersianCalendar.toGregorian({ year: 3178, month: 1, day: 1 })).toThrow(
      InvalidDateError,
    );
    expect(() => PersianCalendar.toGregorian({ year: 1400, month: 12, day: 30 })).toThrow(
      InvalidDateError,
    );
  });
});
