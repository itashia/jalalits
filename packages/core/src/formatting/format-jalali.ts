import { PersianCalendar } from '../calendar/persian-calendar.js';
import { InvalidDateError } from '../errors/invalid-date.js';
import { toPersianDigits } from '../localization/digits.js';
import type { JalaliDateFields } from '../types/calendar.js';
import type { ZonedDateTimeParts } from '../timezone/intl-timezone.js';

const MONTHS = [
  '',
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];
const WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

function pad(value: number, size = 2): string {
  return String(value).padStart(size, '0');
}

function weekday(parts: ZonedDateTimeParts): number {
  return (new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay() + 1) % 7;
}

function timeToken(
  token: string,
  parts: ZonedDateTimeParts,
  timeZone: string,
  epochMs: number,
  microsecond: number,
): string {
  const hour12 = parts.hour % 12 || 12;
  const offsetMinutes = Math.round(
    (Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) -
      Math.floor(epochMs / 1000) * 1000) /
      60_000,
  );
  const sign = offsetMinutes < 0 ? '-' : '+';
  const offset = `${sign}${pad(Math.floor(Math.abs(offsetMinutes) / 60))}`;
  const offsetMinute = pad(Math.abs(offsetMinutes) % 60);
  const tokens: Record<string, string> = {
    H: pad(parts.hour),
    G: String(parts.hour),
    h: pad(hour12),
    g: String(hour12),
    i: pad(parts.minute),
    s: pad(parts.second),
    u: `${pad(parts.millisecond, 3)}${pad(microsecond, 3)}`,
    a: parts.hour < 12 ? 'am' : 'pm',
    A: parts.hour < 12 ? 'AM' : 'PM',
    e: timeZone,
    P: offsetMinutes === 0 ? 'Z' : `${offset}:${offsetMinute}`,
    O: `${offset}${offsetMinute}`,
    U: String(Math.floor(epochMs / 1000)),
  };
  return tokens[token] ?? '';
}

export function formatJalali(
  fields: JalaliDateFields,
  parts: ZonedDateTimeParts,
  timeZone: string,
  epochMs: number,
  microsecond: number,
  format = 'Y/m/d',
  persianDigits = false,
): string {
  let output = '';
  let escaped = false;
  const dayOfYear =
    (fields.month <= 7 ? (fields.month - 1) * 31 : 186 + (fields.month - 7) * 30) + fields.day - 1;
  const monthName = MONTHS[fields.month];
  const weekdayName = WEEKDAYS[weekday(parts)];
  if (monthName === undefined || weekdayName === undefined)
    throw new InvalidDateError('Date components are outside the formatting range.');
  const values: Record<string, string> = {
    Y: pad(fields.year, 4),
    m: pad(fields.month),
    n: String(fields.month),
    d: pad(fields.day),
    j: String(fields.day),
    F: monthName,
    l: weekdayName,
    z: String(dayOfYear),
    t: String(PersianCalendar.daysInMonth(fields.year, fields.month)),
    L: PersianCalendar.isLeapYear(fields.year) ? '1' : '0',
  };
  for (const token of format) {
    if (escaped) {
      output += token;
      escaped = false;
      continue;
    }
    if (token === '\\') {
      escaped = true;
      continue;
    }
    const formatted = values[token];
    if (formatted !== undefined) output += formatted;
    else if ('HGhgisuaAPOeU'.includes(token))
      output += timeToken(token, parts, timeZone, epochMs, microsecond);
    else if (/[A-Za-z]/.test(token))
      throw new InvalidDateError(`Unsupported format token: ${token}`);
    else output += token;
  }
  if (escaped) throw new InvalidDateError('Trailing format escape.');
  return persianDigits ? toPersianDigits(output) : output;
}

export function formatGregorian(
  parts: ZonedDateTimeParts,
  timeZone: string,
  epochMs: number,
  microsecond: number,
  nanosecond: number,
): string {
  return `${pad(parts.year, 4)}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}.${pad(parts.millisecond, 3)}${pad(microsecond, 3)}${pad(nanosecond, 3)}${timeToken('P', parts, timeZone, epochMs, microsecond)}`;
}
