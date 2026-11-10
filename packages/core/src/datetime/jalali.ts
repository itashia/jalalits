import { JalaliDateTime } from './jalali-date-time.js';
import type { DateTimeFields } from '../types/calendar.js';

/** Input accepted by the `jalali()` convenience function. */
export type JalaliInput = string | Date | DateTimeFields;

/**
 * Creates a Jalali date-time from a strict Jalali date string, a JavaScript Date,
 * or Jalali calendar fields. Strings and fields are interpreted in `timeZone`.
 */
export function jalali(input: JalaliInput, timeZone = 'UTC'): JalaliDateTime {
  if (typeof input === 'string') return JalaliDateTime.parse(input, timeZone);
  if (input instanceof Date) return JalaliDateTime.fromDate(input, timeZone);
  return JalaliDateTime.create(input, timeZone);
}
