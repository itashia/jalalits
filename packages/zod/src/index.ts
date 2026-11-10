import { JalaliDateTime, InvalidDateError, toLatinDigits } from 'jalalits';
import { z } from 'zod';

export type ZodLocale = 'en' | 'fa';

export interface JalaliSchemaOptions {
  readonly min?: string;
  readonly max?: string;
  readonly timeZone?: string;
  readonly locale?: ZodLocale;
  readonly message?: string;
  readonly minMessage?: string;
  readonly maxMessage?: string;
}

const messages = {
  en: {
    invalidDate: 'Expected a valid Jalali date in YYYY/MM/DD format.',
    invalidDateTime: 'Expected a valid Jalali date-time in YYYY/MM/DD HH:mm:ss[.uuuuuu] format.',
    min: (value: string): string => `Date must be on or after ${value}.`,
    max: (value: string): string => `Date must be on or before ${value}.`,
    range: 'Range start must be on or before range end.',
  },
  fa: {
    invalidDate: 'تاریخ جلالی معتبر با قالب YYYY/MM/DD وارد کنید.',
    invalidDateTime: 'تاریخ و زمان معتبر با قالب YYYY/MM/DD HH:mm:ss[.uuuuuu] وارد کنید.',
    min: (value: string): string => `تاریخ باید در ${value} یا پس از آن باشد.`,
    max: (value: string): string => `تاریخ باید در ${value} یا پیش از آن باشد.`,
    range: 'تاریخ شروع بازه باید قبل یا مساوی تاریخ پایان باشد.',
  },
} as const;

interface ResolvedOptions extends JalaliSchemaOptions {
  readonly timeZone: string;
  readonly minValue?: JalaliDateTime;
  readonly maxValue?: JalaliDateTime;
}

function resolveOptions(options: JalaliSchemaOptions): ResolvedOptions {
  const timeZone = options.timeZone ?? 'UTC';
  let minValue: JalaliDateTime | undefined;
  let maxValue: JalaliDateTime | undefined;
  try {
    if (options.min !== undefined) minValue = JalaliDateTime.parse(options.min, timeZone);
  } catch (cause) {
    throw new RangeError(`Invalid Jalali minimum constraint: ${String(options.min)}`, { cause });
  }
  try {
    if (options.max !== undefined) maxValue = JalaliDateTime.parse(options.max, timeZone);
  } catch (cause) {
    throw new RangeError(`Invalid Jalali maximum constraint: ${String(options.max)}`, { cause });
  }
  if (minValue && maxValue && minValue.compare(maxValue) > 0)
    throw new RangeError('Jalali minimum constraint must not be after maximum constraint.');
  return {
    ...options,
    timeZone,
    ...(minValue ? { minValue } : {}),
    ...(maxValue ? { maxValue } : {}),
  };
}

function boundedSchema(
  options: JalaliSchemaOptions,
  kind: 'date' | 'dateTime',
): z.ZodType<JalaliDateTime, string> {
  const resolved = resolveOptions(options);
  const locale = resolved.locale ?? 'en';
  const copy = messages[locale];
  return z.string().transform((input, context) => {
    try {
      const date =
        kind === 'date'
          ? JalaliDateTime.parse(input, resolved.timeZone)
          : parseJalaliDateTime(input, resolved.timeZone);
      if (resolved.minValue && date.compare(resolved.minValue) < 0) {
        context.addIssue({
          code: 'custom',
          message: resolved.minMessage ?? copy.min(resolved.minValue.format()),
        });
        return z.NEVER;
      }
      if (resolved.maxValue && date.compare(resolved.maxValue) > 0) {
        context.addIssue({
          code: 'custom',
          message: resolved.maxMessage ?? copy.max(resolved.maxValue.format()),
        });
        return z.NEVER;
      }
      return date;
    } catch (cause) {
      context.addIssue({
        code: 'custom',
        message: resolved.message ?? (kind === 'date' ? copy.invalidDate : copy.invalidDateTime),
        ...(cause instanceof InvalidDateError ? { params: { cause: cause.message } } : {}),
      });
      return z.NEVER;
    }
  });
}

function parseJalaliDateTime(input: string, timeZone: string): JalaliDateTime {
  const normalized = toLatinDigits(input);
  const withMicroseconds = /^(\d{4}\/\d{2}\/\d{2}) (\d{2}:\d{2}:\d{2})\.(\d{6})$/.exec(normalized);
  if (withMicroseconds) return JalaliDateTime.parseFormat('Y/m/d H:i:s.u', normalized, timeZone);
  const withoutMicroseconds = /^(\d{4}\/\d{2}\/\d{2}) (\d{2}:\d{2}:\d{2})$/.exec(normalized);
  if (withoutMicroseconds) return JalaliDateTime.parseFormat('Y/m/d H:i:s', normalized, timeZone);
  throw new InvalidDateError(
    'Expected YYYY/MM/DD HH:mm:ss optionally followed by six fractional digits.',
  );
}

/** Validates YYYY/MM/DD strings and transforms successful values to JalaliDateTime. */
export function zJalaliDate(options: JalaliSchemaOptions = {}): ReturnType<typeof boundedSchema> {
  return boundedSchema(options, 'date');
}

/** Validates Jalali date-times with seconds and optional six-digit microseconds. */
export function zJalaliDateTime(
  options: JalaliSchemaOptions = {},
): ReturnType<typeof boundedSchema> {
  return boundedSchema(options, 'dateTime');
}

export interface JalaliRangeSchemaOptions extends JalaliSchemaOptions {
  readonly rangeMessage?: string;
}

/** Validates and transforms an inclusive `{start, end}` Jalali date range. */
export function zJalaliRange(options: JalaliRangeSchemaOptions = {}): z.ZodType<
  {
    start: JalaliDateTime;
    end: JalaliDateTime;
  },
  {
    start: string;
    end: string;
  }
> {
  const { rangeMessage, ...dateOptions } = options;
  const locale = options.locale ?? 'en';
  return z
    .object({ start: zJalaliDate(dateOptions), end: zJalaliDate(dateOptions) })
    .superRefine((range, context) => {
      if (range.start.compare(range.end) > 0) {
        context.addIssue({
          code: 'custom',
          path: ['end'],
          message: rangeMessage ?? messages[locale].range,
        });
      }
    });
}
