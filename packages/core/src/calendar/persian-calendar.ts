import { InvalidDateError } from '../errors/invalid-date.js';
import type { GregorianDateFields, JalaliDateFields } from '../types/calendar.js';

const BREAKS = [
  9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456,
  3178,
] as const;
const MONTH_STARTS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334] as const;

function yearInfo(year: number): readonly [march: number, leap: number] {
  if (!Number.isInteger(year) || year < 1 || year > 3177) {
    throw new InvalidDateError('Jalali year must be between 1 and 3177.');
  }
  let previous = -61;
  let leaps = -14;
  let jump = 0;
  for (const boundary of BREAKS) {
    jump = boundary - previous;
    if (year < boundary) break;
    leaps += Math.floor(jump / 33) * 8 + Math.floor((jump % 33) / 4);
    previous = boundary;
  }
  let elapsed = year - previous;
  leaps += Math.floor(elapsed / 33) * 8 + Math.floor(((elapsed % 33) + 3) / 4);
  if (jump % 33 === 4 && jump - elapsed === 4) leaps++;
  const gregorian = year + 621;
  const march =
    20 +
    leaps -
    (Math.floor(gregorian / 4) - Math.floor(((Math.floor(gregorian / 100) + 1) * 3) / 4) - 150);
  if (jump - elapsed < 6) elapsed = elapsed - jump + Math.floor((jump + 4) / 33) * 33;
  const remainder = (((elapsed + 1) % 33) - 1) % 4;
  return [march, remainder === -1 ? 4 : remainder];
}

function gregorianLeap(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function ordinal(year: number, month: number, day: number): number {
  const previous = year - 1;
  const beforeMonth = MONTH_STARTS[month - 1];
  if (beforeMonth === undefined)
    throw new InvalidDateError('Gregorian month must be between 1 and 12.');
  return (
    365 * previous +
    Math.floor(previous / 4) -
    Math.floor(previous / 100) +
    Math.floor(previous / 400) +
    beforeMonth +
    (month > 2 && gregorianLeap(year) ? 1 : 0) +
    day
  );
}

function validateGregorian({ year, month, day }: GregorianDateFields): void {
  const monthLength =
    month === 2 ? (gregorianLeap(year) ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;
  if (
    !Number.isInteger(year) ||
    year < 622 ||
    year > 3799 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > monthLength
  ) {
    throw new InvalidDateError('Invalid or unsupported Gregorian date.');
  }
}

export const PersianCalendar = Object.freeze({
  minimumYear: 1,
  maximumYear: 3177,
  toGregorian({ year, month, day }: JalaliDateFields): GregorianDateFields {
    const [march, leap] = yearInfo(year);
    const maxDay = month <= 6 ? 31 : month < 12 || leap === 0 ? 30 : 29;
    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(day) ||
      day < 1 ||
      day > maxDay
    ) {
      throw new InvalidDateError('Invalid Jalali date.');
    }
    let gYear = year + 621;
    let gMonth = 3;
    let gDay = march + (month <= 7 ? (month - 1) * 31 : 186 + (month - 7) * 30) + day - 1;
    for (;;) {
      const length =
        gMonth === 2 ? (gregorianLeap(gYear) ? 29 : 28) : [4, 6, 9, 11].includes(gMonth) ? 30 : 31;
      if (gDay <= length) break;
      gDay -= length;
      if (++gMonth === 13) {
        gMonth = 1;
        gYear++;
      }
    }
    return { year: gYear, month: gMonth, day: gDay };
  },
  fromGregorian(fields: GregorianDateFields): JalaliDateFields {
    validateGregorian(fields);
    let jYear = Math.min(fields.year - 621, 3177);
    let [march, leap] = yearInfo(jYear);
    let offset = ordinal(fields.year, fields.month, fields.day) - ordinal(jYear + 621, 3, march);
    if (offset < 0) {
      jYear--;
      [march, leap] = yearInfo(jYear);
      offset = ordinal(fields.year, fields.month, fields.day) - ordinal(jYear + 621, 3, march);
    }
    if (offset >= (leap === 0 ? 366 : 365))
      throw new InvalidDateError('Gregorian date exceeds the supported Jalali range.');
    return offset < 186
      ? { year: jYear, month: Math.floor(offset / 31) + 1, day: (offset % 31) + 1 }
      : { year: jYear, month: Math.floor((offset - 186) / 30) + 7, day: ((offset - 186) % 30) + 1 };
  },
  daysInMonth(year: number, month: number): number {
    const [, leap] = yearInfo(year);
    if (!Number.isInteger(month) || month < 1 || month > 12)
      throw new InvalidDateError('Jalali month must be between 1 and 12.');
    return month <= 6 ? 31 : month < 12 || leap === 0 ? 30 : 29;
  },
  isLeapYear(year: number): boolean {
    return yearInfo(year)[1] === 0;
  },
});
