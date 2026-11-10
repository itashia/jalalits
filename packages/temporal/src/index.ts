import { JalaliDateTime, PersianCalendar } from 'jalalits';

export interface TemporalPlainDateLike {
  toString(): string;
  readonly calendarId?: string;
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export interface TemporalPlainDateTimeLike extends TemporalPlainDateLike {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
  readonly microsecond: number;
  readonly nanosecond: number;
}

export interface TemporalInstantLike {
  readonly epochNanoseconds: bigint;
  toString(): string;
  toZonedDateTimeISO(timeZone: string): TemporalZonedDateTimeLike;
}

export interface TemporalZonedDateTimeLike extends TemporalPlainDateTimeLike {
  readonly epochNanoseconds: bigint;
  readonly timeZoneId: string;
  toString(): string;
  toPlainDate(): TemporalPlainDateLike;
  toPlainDateTime(): TemporalPlainDateTimeLike;
}

export interface TemporalNamespace {
  readonly Instant: {
    fromEpochNanoseconds(epochNanoseconds: bigint): TemporalInstantLike;
  };
  readonly PlainDate: {
    from(fields: { year: number; month: number; day: number }): TemporalPlainDateLike;
  };
  readonly PlainDateTime: {
    from(fields: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      second: number;
      millisecond: number;
      microsecond: number;
      nanosecond: number;
    }): TemporalPlainDateTimeLike;
  };
}

function assertIsoCalendar(calendarId: string | undefined): void {
  if (calendarId !== undefined && calendarId !== 'iso8601')
    throw new RangeError(
      `Temporal calendar ${calendarId} is unsupported; pass ISO calendar values.`,
    );
}

/** Converts an instant to a JalaliTS value without dropping nanosecond precision. */
export function fromTemporalInstant(
  instant: TemporalInstantLike,
  timeZone = 'UTC',
): JalaliDateTime {
  return JalaliDateTime.fromEpochNanoseconds(instant.epochNanoseconds, timeZone);
}

/** Converts ISO Temporal.PlainDate fields to midnight in an explicit timezone. */
export function fromTemporalPlainDate(
  date: TemporalPlainDateLike,
  timeZone = 'UTC',
): JalaliDateTime {
  assertIsoCalendar(date.calendarId);
  const jalali = PersianCalendar.fromGregorian(date);
  return JalaliDateTime.create(jalali, timeZone);
}

/** Interprets a PlainDateTime as local wall time in the explicit timezone. */
export function fromTemporalPlainDateTime(
  dateTime: TemporalPlainDateTimeLike,
  timeZone = 'UTC',
): JalaliDateTime {
  assertIsoCalendar(dateTime.calendarId);
  const jalali = PersianCalendar.fromGregorian(dateTime);
  return JalaliDateTime.create(
    {
      ...jalali,
      hour: dateTime.hour,
      minute: dateTime.minute,
      second: dateTime.second,
      nanosecond:
        dateTime.millisecond * 1_000_000 + dateTime.microsecond * 1_000 + dateTime.nanosecond,
    },
    timeZone,
  );
}

/** Converts a ZonedDateTime using its instant and IANA timezone. */
export function fromTemporalZonedDateTime(dateTime: TemporalZonedDateTimeLike): JalaliDateTime {
  return JalaliDateTime.fromEpochNanoseconds(dateTime.epochNanoseconds, dateTime.timeZoneId);
}

export function toTemporalInstant(
  value: JalaliDateTime,
  temporal: TemporalNamespace,
): TemporalInstantLike {
  return temporal.Instant.fromEpochNanoseconds(value.epochNanoseconds);
}

export function toTemporalPlainDate(
  value: JalaliDateTime,
  temporal: TemporalNamespace,
): TemporalPlainDateLike {
  return toTemporalZonedDateTime(value, temporal).toPlainDate();
}

export function toTemporalPlainDateTime(
  value: JalaliDateTime,
  temporal: TemporalNamespace,
): TemporalPlainDateTimeLike {
  return toTemporalZonedDateTime(value, temporal).toPlainDateTime();
}

export function toTemporalZonedDateTime(
  value: JalaliDateTime,
  temporal: TemporalNamespace,
): TemporalZonedDateTimeLike {
  return temporal.Instant.fromEpochNanoseconds(value.epochNanoseconds).toZonedDateTimeISO(
    value.timeZone,
  );
}
