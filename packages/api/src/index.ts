import { JalaliDateTime, PersianCalendar, toLatinDigits } from 'jalalits';
import type { GregorianDateFields } from 'jalalits';

export type ApiDateKind = 'date' | 'datetime';
export type ApiDateCalendar = 'jalali' | 'gregorian';

export interface GregorianDateTimeFields extends GregorianDateFields {
  readonly hour?: number;
  readonly minute?: number;
  readonly second?: number;
  readonly millisecond?: number;
  readonly microsecond?: number;
  readonly nanosecond?: number;
}

export interface ParseRequestDateOptions {
  readonly kind?: ApiDateKind;
  readonly timeZone?: string;
}

/** Parses strict Jalali API input. Date-times require YYYY/MM/DD HH:mm:ss[.uuuuuu]. */
export function parseRequestDate(
  input: unknown,
  options: ParseRequestDateOptions = {},
): JalaliDateTime {
  if (typeof input !== 'string') throw new TypeError('Date input must be a string.');
  const timeZone = options.timeZone ?? 'UTC';
  if (options.kind === 'datetime') {
    const normalized = toLatinDigits(input);
    if (/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}\.\d{6}$/.test(normalized))
      return JalaliDateTime.parseFormat('Y/m/d H:i:s.u', normalized, timeZone);
    if (/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized))
      return JalaliDateTime.parseFormat('Y/m/d H:i:s', normalized, timeZone);
    throw new RangeError(
      'Expected Jalali datetime YYYY/MM/DD HH:mm:ss with optional six-digit microseconds.',
    );
  }
  return JalaliDateTime.parse(input, timeZone);
}

export interface SerializeResponseDateOptions {
  readonly kind?: ApiDateKind;
  readonly calendar?: ApiDateCalendar;
}

/** Serializes a date-only field as a calendar date or a datetime as a zoned value. */
export function serializeResponseDate(
  value: JalaliDateTime,
  options: SerializeResponseDateOptions = {},
): string {
  const kind = options.kind ?? 'datetime';
  const calendar = options.calendar ?? 'gregorian';
  if (kind === 'date' && calendar === 'jalali') return value.format('Y/m/d');
  if (kind === 'datetime' && calendar === 'jalali') return value.format('Y/m/d H:i:s.u P');
  if (kind === 'datetime') return value.formatGregorian();
  const gregorian = PersianCalendar.toGregorian(value);
  return `${String(gregorian.year).padStart(4, '0')}-${String(gregorian.month).padStart(2, '0')}-${String(gregorian.day).padStart(2, '0')}`;
}

/** Normalizes user-entered date text to strict ASCII Jalali digits and fixed width. */
export function normalizeFormDateInput(input: string, timeZone = 'UTC'): string {
  if (input === '') return '';
  return JalaliDateTime.parse(input, timeZone).format('Y/m/d');
}

/** Creates a value from explicit proleptic Gregorian local wall fields. */
export function fromGregorianDate(
  fields: GregorianDateTimeFields,
  timeZone = 'UTC',
): JalaliDateTime {
  const gregorian: GregorianDateFields = {
    year: fields.year,
    month: fields.month,
    day: fields.day,
  };
  const jalali = PersianCalendar.fromGregorian(gregorian);
  return JalaliDateTime.create({ ...jalali, ...timeFields(fields) }, timeZone);
}

function timeFields(
  fields: GregorianDateTimeFields,
): Omit<GregorianDateTimeFields, 'year' | 'month' | 'day'> {
  return {
    ...(fields.hour === undefined ? {} : { hour: fields.hour }),
    ...(fields.minute === undefined ? {} : { minute: fields.minute }),
    ...(fields.second === undefined ? {} : { second: fields.second }),
    ...(fields.millisecond === undefined ? {} : { millisecond: fields.millisecond }),
    ...(fields.microsecond === undefined ? {} : { microsecond: fields.microsecond }),
    ...(fields.nanosecond === undefined ? {} : { nanosecond: fields.nanosecond }),
  };
}

/** Returns the Gregorian calendar fields corresponding to the Jalali date. */
export function toGregorianDate(value: JalaliDateTime): GregorianDateFields {
  return PersianCalendar.toGregorian(value);
}

/** Validates a parsed API value before passing it to application code. */
export function validateApiDate(
  input: unknown,
  options: ParseRequestDateOptions = {},
):
  | { readonly success: true; readonly value: JalaliDateTime }
  | { readonly success: false; readonly error: Error } {
  try {
    return { success: true, value: parseRequestDate(input, options) };
  } catch (cause) {
    return { success: false, error: cause instanceof Error ? cause : new Error(String(cause)) };
  }
}
