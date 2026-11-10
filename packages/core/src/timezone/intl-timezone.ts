import { InvalidDateError } from '../errors/invalid-date.js';
import type { GregorianDateFields } from '../types/calendar.js';

export interface ZonedDateTimeParts extends GregorianDateFields {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
}

// Intl formatters are immutable after construction; this bounded cache avoids rebuilding one
// for every date operation without introducing timezone defaults or mutable user configuration.
const FORMATTER_CACHE_LIMIT = 64;
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);
  if (cached !== undefined) return cached;
  try {
    const value = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    if (formatterCache.size >= FORMATTER_CACHE_LIMIT) {
      const oldest = formatterCache.keys().next().value;
      if (oldest !== undefined) formatterCache.delete(oldest);
    }
    formatterCache.set(timeZone, value);
    return value;
  } catch (cause) {
    throw new InvalidDateError(`Invalid timezone: ${timeZone}`, { cause });
  }
}

export function assertTimeZone(timeZone: string): void {
  formatter(timeZone);
}

export function zonedPartsAt(epochMs: number, timeZone: string): ZonedDateTimeParts {
  let year = 0;
  let month = 0;
  let day = 0;
  let hour = 0;
  let minute = 0;
  let second = 0;
  for (const part of formatter(timeZone).formatToParts(new Date(epochMs))) {
    const value = Number(part.value);
    switch (part.type) {
      case 'year':
        year = value;
        break;
      case 'month':
        month = value;
        break;
      case 'day':
        day = value;
        break;
      case 'hour':
        hour = value;
        break;
      case 'minute':
        minute = value;
        break;
      case 'second':
        second = value;
        break;
    }
  }
  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond: ((epochMs % 1000) + 1000) % 1000,
  };
}

export function wallTimeToEpoch(fields: ZonedDateTimeParts, timeZone: string): number {
  let candidate = Date.UTC(
    fields.year,
    fields.month - 1,
    fields.day,
    fields.hour,
    fields.minute,
    fields.second,
    fields.millisecond,
  );
  if (timeZone === 'UTC' || timeZone === 'Etc/UTC') return candidate;
  for (let index = 0; index < 4; index++) {
    const current = zonedPartsAt(candidate, timeZone);
    const represented = Date.UTC(
      current.year,
      current.month - 1,
      current.day,
      current.hour,
      current.minute,
      current.second,
      current.millisecond,
    );
    const desired = Date.UTC(
      fields.year,
      fields.month - 1,
      fields.day,
      fields.hour,
      fields.minute,
      fields.second,
      fields.millisecond,
    );
    const delta = desired - represented;
    if (delta === 0) return candidate;
    candidate += delta;
  }
  throw new InvalidDateError('Local time does not exist in this timezone.');
}
