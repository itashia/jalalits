import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { PersianCalendar } from '../src/calendar/persian-calendar.js';
import { JalaliDateTime } from '../src/datetime/jalali-date-time.js';

interface Fixture {
  conversions: {
    jalali: { year: number; month: number; day: number };
    gregorian: { year: number; month: number; day: number };
  }[];
  leapYears: { year: number; leap: boolean }[];
  monthLengths: { year: number; month: number; days: number }[];
  arithmetic: {
    date: { year: number; month: number; day: number };
    unit: 'months' | 'days';
    amount: number;
    expected: string;
  }[];
  formatting: { date: string; format: string; expected: string }[];
  parsing: { input: string; expected: string }[];
  weeks: { date: string; start: string; weekday: number }[];
  timezone: {
    instant: string;
    timeZone: string;
    calendarDayElapsedSeconds: number;
    elapsed24HoursSeconds: number;
  }[];
  comparisons: { instant: string; timeZones: [string, string]; comparison: number }[];
  invalidDates: string[];
}

const fixtureUrl = new URL(
  '../../../fixtures/compatibility/laravel-jalali-v1.json',
  import.meta.url,
);
const fixture = JSON.parse(await readFile(fixtureUrl, 'utf8')) as Fixture;

describe('Laravel Jalali compatibility fixture', () => {
  it('matches the recorded conversion, leap-year, and month-length anchors', () => {
    for (const { jalali, gregorian } of fixture.conversions) {
      expect(PersianCalendar.toGregorian(jalali)).toEqual(gregorian);
      expect(PersianCalendar.fromGregorian(gregorian)).toEqual(jalali);
    }
    for (const row of fixture.leapYears)
      expect(PersianCalendar.isLeapYear(row.year)).toBe(row.leap);
    for (const row of fixture.monthLengths)
      expect(PersianCalendar.daysInMonth(row.year, row.month)).toBe(row.days);
  });

  it('matches documented parsing, formatting, calendar arithmetic, and Saturday week anchors', () => {
    for (const row of fixture.parsing)
      expect(JalaliDateTime.parse(row.input).format()).toBe(row.expected);
    for (const row of fixture.formatting)
      expect(JalaliDateTime.parse(row.date).format(row.format)).toBe(row.expected);
    for (const row of fixture.arithmetic) {
      const value = JalaliDateTime.create(row.date);
      const result =
        row.unit === 'months' ? value.addMonths(row.amount) : value.addDays(row.amount);
      expect(result.format()).toBe(row.expected);
    }
    for (const row of fixture.weeks) {
      const value = JalaliDateTime.parse(row.date);
      expect(value.startOfWeek().format()).toBe(row.start);
      expect(value.dayOfWeek()).toBe(row.weekday);
    }
  });

  it('matches instant comparison, timezone day arithmetic, and invalid-input rejection', () => {
    for (const row of fixture.timezone) {
      const value = JalaliDateTime.fromDate(new Date(row.instant), row.timeZone);
      expect(value.addDays(1).epochMilliseconds - value.epochMilliseconds).toBe(
        row.calendarDayElapsedSeconds * 1000,
      );
      expect(value.addHours(24).epochMilliseconds - value.epochMilliseconds).toBe(
        row.elapsed24HoursSeconds * 1000,
      );
    }
    for (const row of fixture.comparisons) {
      const utc = JalaliDateTime.fromDate(new Date(row.instant), row.timeZones[0]);
      const local = utc.toTimeZone(row.timeZones[1]);
      expect(utc.compare(local)).toBe(row.comparison);
    }
    for (const input of fixture.invalidDates) expect(() => JalaliDateTime.parse(input)).toThrow();
  });
});
