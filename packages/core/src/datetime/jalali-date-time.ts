import { PersianCalendar } from '../calendar/persian-calendar.js';
import { InvalidDateError } from '../errors/invalid-date.js';
import { formatGregorian, formatJalali } from '../formatting/format-jalali.js';
import { parseJalaliDate, parseJalaliFormat } from '../parsing/parse-jalali.js';
import { assertTimeZone, wallTimeToEpoch, zonedPartsAt } from '../timezone/intl-timezone.js';
import type { ZonedDateTimeParts } from '../timezone/intl-timezone.js';
import type { DateTimeFields } from '../types/calendar.js';

export class JalaliDateTime {
  readonly #epochMs: number;
  readonly #microsecond: number;
  readonly #nanosecond: number;
  readonly #timeZone: string;
  readonly year!: number;
  readonly month!: number;
  readonly day!: number;

  private constructor(epochMs: number, microsecond: number, nanosecond: number, timeZone: string) {
    if (!Number.isFinite(epochMs)) throw new InvalidDateError('Invalid instant.');
    assertTimeZone(timeZone);
    this.#epochMs = epochMs;
    this.#microsecond = microsecond;
    this.#nanosecond = nanosecond;
    this.#timeZone = timeZone;
    const gregorian = zonedPartsAt(epochMs, timeZone);
    Object.assign(this, PersianCalendar.fromGregorian(gregorian));
    Object.freeze(this);
  }

  static create(fields: DateTimeFields, timeZone = 'UTC'): JalaliDateTime {
    const gregorian = PersianCalendar.toGregorian(fields);
    const hour = fields.hour ?? 0;
    const minute = fields.minute ?? 0;
    const second = fields.second ?? 0;
    const millisecond =
      fields.nanosecond !== undefined
        ? Math.floor(fields.nanosecond / 1_000_000)
        : (fields.millisecond ?? Math.floor((fields.microsecond ?? 0) / 1000));
    const microsecond =
      fields.nanosecond !== undefined
        ? Math.floor(fields.nanosecond / 1000) % 1000
        : (fields.microsecond ?? millisecond * 1000) % 1000;
    const nanosecond = (fields.nanosecond ?? 0) % 1000;
    if (
      ![hour, minute, second, millisecond, microsecond, nanosecond].every(Number.isInteger) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59 ||
      second < 0 ||
      second > 59 ||
      millisecond < 0 ||
      millisecond > 999 ||
      microsecond < 0 ||
      microsecond > 999 ||
      (fields.nanosecond !== undefined &&
        (fields.nanosecond < 0 || fields.nanosecond > 999_999_999))
    ) {
      throw new InvalidDateError('Invalid time components.');
    }
    const epochMs = wallTimeToEpoch({ ...gregorian, hour, minute, second, millisecond }, timeZone);
    return new JalaliDateTime(epochMs, microsecond, nanosecond, timeZone);
  }

  static parse(input: string, timeZone = 'UTC'): JalaliDateTime {
    return JalaliDateTime.create(parseJalaliDate(input), timeZone);
  }

  static parseFormat(format: string, input: string, timeZone = 'UTC'): JalaliDateTime {
    return JalaliDateTime.create(parseJalaliFormat(format, input), timeZone);
  }

  static fromDate(date: Date, timeZone = 'UTC'): JalaliDateTime {
    if (Number.isNaN(date.getTime())) throw new InvalidDateError('Invalid Date object.');
    return new JalaliDateTime(date.getTime(), 0, 0, timeZone);
  }

  static fromEpochNanoseconds(epochNanoseconds: bigint, timeZone = 'UTC'): JalaliDateTime {
    let milliseconds = epochNanoseconds / 1_000_000n;
    let remainder = epochNanoseconds % 1_000_000n;
    if (remainder < 0n) {
      milliseconds -= 1n;
      remainder += 1_000_000n;
    }
    const epochMs = Number(milliseconds);
    if (!Number.isSafeInteger(epochMs))
      throw new InvalidDateError('Instant exceeds JavaScript Date range.');
    return new JalaliDateTime(
      epochMs,
      Number(remainder / 1000n),
      Number(remainder % 1000n),
      timeZone,
    );
  }

  get timeZone(): string {
    return this.#timeZone;
  }
  get epochMilliseconds(): number {
    return this.#epochMs;
  }
  get microsecond(): number {
    return this.#microsecond;
  }
  get nanosecond(): number {
    return this.#nanosecond;
  }
  get epochNanoseconds(): bigint {
    return (
      BigInt(this.#epochMs) * 1_000_000n +
      BigInt(this.#microsecond) * 1_000n +
      BigInt(this.#nanosecond)
    );
  }
  toDate(): Date {
    return new Date(this.#epochMs);
  }
  toISOString(): string {
    return this.toDate().toISOString();
  }

  #parts(): ZonedDateTimeParts {
    return zonedPartsAt(this.#epochMs, this.#timeZone);
  }

  format(format = 'Y/m/d', persianDigits = false): string {
    return formatJalali(
      this,
      this.#parts(),
      this.#timeZone,
      this.#epochMs,
      this.#microsecond,
      format,
      persianDigits,
    );
  }
  formatGregorian(): string {
    return formatGregorian(
      this.#parts(),
      this.#timeZone,
      this.#epochMs,
      this.#microsecond,
      this.#nanosecond,
    );
  }
  dayOfWeek(): number {
    return (
      (new Date(
        Date.UTC(this.#parts().year, this.#parts().month - 1, this.#parts().day),
      ).getUTCDay() +
        1) %
      7
    );
  }
  isLeapYear(): boolean {
    return PersianCalendar.isLeapYear(this.year);
  }
  daysInMonth(): number {
    return PersianCalendar.daysInMonth(this.year, this.month);
  }
  compare(other: JalaliDateTime): number {
    return this.#epochMs === other.#epochMs
      ? this.#microsecond === other.#microsecond
        ? Math.sign(this.#nanosecond - other.#nanosecond)
        : Math.sign(this.#microsecond - other.#microsecond)
      : Math.sign(this.#epochMs - other.#epochMs);
  }
  equals(other: JalaliDateTime): boolean {
    return this.compare(other) === 0;
  }
  isBefore(other: JalaliDateTime): boolean {
    return this.compare(other) < 0;
  }
  isAfter(other: JalaliDateTime): boolean {
    return this.compare(other) > 0;
  }
  addDays(days: number): JalaliDateTime {
    return this.#calendarAdd(days, 0);
  }
  addMonths(months: number): JalaliDateTime {
    return this.#calendarAdd(0, months);
  }
  addYears(years: number): JalaliDateTime {
    return this.addMonths(years * 12);
  }
  #calendarAdd(days: number, months: number): JalaliDateTime {
    if (!Number.isSafeInteger(days) || !Number.isSafeInteger(months))
      throw new InvalidDateError('Displacement must be a safe integer.');
    const index = (this.year - 1) * 12 + this.month - 1 + months;
    if (index < 0 || index >= 3177 * 12)
      throw new InvalidDateError('Result exceeds the supported range.');
    const year = Math.floor(index / 12) + 1;
    const month = (index % 12) + 1;
    const day = Math.min(this.day, PersianCalendar.daysInMonth(year, month));
    const shifted = JalaliDateTime.create(
      {
        year,
        month,
        day,
        hour: this.#parts().hour,
        minute: this.#parts().minute,
        second: this.#parts().second,
        nanosecond:
          this.#parts().millisecond * 1_000_000 + this.#microsecond * 1_000 + this.#nanosecond,
      },
      this.#timeZone,
    );
    if (days === 0) return shifted;
    const gregorian = PersianCalendar.toGregorian({
      year: shifted.year,
      month: shifted.month,
      day: shifted.day,
    });
    const date = new Date(Date.UTC(gregorian.year, gregorian.month - 1, gregorian.day + days));
    const target = PersianCalendar.fromGregorian({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    });
    return JalaliDateTime.create(
      {
        ...target,
        hour: this.#parts().hour,
        minute: this.#parts().minute,
        second: this.#parts().second,
        nanosecond:
          this.#parts().millisecond * 1_000_000 + this.#microsecond * 1_000 + this.#nanosecond,
      },
      this.#timeZone,
    );
  }
  addHours(hours: number): JalaliDateTime {
    return this.#addElapsed(hours * 3_600_000);
  }
  addMinutes(minutes: number): JalaliDateTime {
    return this.#addElapsed(minutes * 60_000);
  }
  addSeconds(seconds: number): JalaliDateTime {
    return this.#addElapsed(seconds * 1000);
  }
  #addElapsed(milliseconds: number): JalaliDateTime {
    if (!Number.isSafeInteger(milliseconds))
      throw new InvalidDateError('Elapsed displacement must be a safe integer.');
    return new JalaliDateTime(
      this.#epochMs + milliseconds,
      this.#microsecond,
      this.#nanosecond,
      this.#timeZone,
    );
  }
  startOfDay(): JalaliDateTime {
    return JalaliDateTime.create(
      { year: this.year, month: this.month, day: this.day },
      this.#timeZone,
    );
  }
  startOfMonth(): JalaliDateTime {
    return this.startOfDay().addDays(1 - this.day);
  }
  startOfWeek(): JalaliDateTime {
    return this.startOfDay().addDays(-this.dayOfWeek());
  }
  endOfDay(): JalaliDateTime {
    const nextDay = this.startOfDay().addDays(1);
    return new JalaliDateTime(nextDay.#epochMs - 1, 999, 999, nextDay.#timeZone);
  }
  toTimeZone(timeZone: string): JalaliDateTime {
    return new JalaliDateTime(this.#epochMs, this.#microsecond, this.#nanosecond, timeZone);
  }
}
