import { parseRequestDate, serializeResponseDate } from '@jalalits/api';
import { JalaliDateTime } from 'jalalits';

export function serializeBooking(input: unknown): { startsAt: string; createdAt: string } {
  const startsAt = parseRequestDate(input, { kind: 'datetime', timeZone: 'Asia/Tehran' });
  const createdAt = JalaliDateTime.create({ year: 1405, month: 8, day: 19, hour: 9 }, 'UTC');
  return {
    startsAt: serializeResponseDate(startsAt, { kind: 'datetime', calendar: 'gregorian' }),
    createdAt: serializeResponseDate(createdAt, { kind: 'datetime', calendar: 'jalali' }),
  };
}

console.log(serializeBooking('۱۴۰۵/۰۸/۱۹ ۱۲:۳۰:۰۰'));
