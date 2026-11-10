'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { JalaliDateTime, PersianCalendar } from 'jalalits';

export type JalaliInput = JalaliDateTime | Date | string | null;

export interface UseJalaliDateOptions {
  readonly initialValue?: JalaliInput;
  readonly timeZone?: string;
}

function normalizeDate(value: JalaliInput, timeZone: string): JalaliDateTime | null {
  if (value === null) return null;
  if (value instanceof JalaliDateTime) return value.toTimeZone(timeZone);
  if (value instanceof Date) return JalaliDateTime.fromDate(value, timeZone);
  return JalaliDateTime.parse(value, timeZone);
}

export interface JalaliDateController {
  readonly date: JalaliDateTime | null;
  readonly setDate: (value: JalaliInput) => void;
  readonly addDays: (days: number) => void;
  readonly addMonths: (months: number) => void;
  readonly clear: () => void;
}

/** Stateful immutable date controller. Supply an initial value for SSR-stable markup. */
export function useJalaliDate(options: UseJalaliDateOptions = {}): JalaliDateController {
  const timeZone = options.timeZone ?? 'UTC';
  const [date, setCurrentDate] = useState<JalaliDateTime | null>(() =>
    normalizeDate(options.initialValue ?? null, timeZone),
  );
  const setDate = useCallback(
    (value: JalaliInput): void => {
      setCurrentDate(normalizeDate(value, timeZone));
    },
    [timeZone],
  );
  const addDays = useCallback((days: number): void => {
    setCurrentDate((current) => current?.addDays(days) ?? null);
  }, []);
  const addMonths = useCallback((months: number): void => {
    setCurrentDate((current) => current?.addMonths(months) ?? null);
  }, []);
  const clear = useCallback((): void => {
    setCurrentDate(null);
  }, []);
  return useMemo(
    () => ({ date, setDate, addDays, addMonths, clear }),
    [date, setDate, addDays, addMonths, clear],
  );
}

export interface CalendarDay {
  readonly value: number;
  readonly date: JalaliDateTime;
  readonly weekday: number;
  readonly isToday: boolean;
}

export interface UseJalaliCalendarOptions {
  readonly year: number;
  readonly month: number;
  readonly timeZone?: string;
  readonly today?: JalaliDateTime;
}

export interface JalaliCalendarData {
  readonly year: number;
  readonly month: number;
  readonly daysInMonth: number;
  /** Weeks start on Saturday. Leading cells are null; the final week is not padded. */
  readonly weeks: readonly (readonly (CalendarDay | null)[])[];
}

/** Returns headless calendar data. Year and month are explicit, so SSR output is deterministic. */
export function useJalaliCalendar(options: UseJalaliCalendarOptions): JalaliCalendarData {
  const { year, month, timeZone = 'UTC', today } = options;
  return useMemo(() => {
    const daysInMonth = PersianCalendar.daysInMonth(year, month);
    const first = JalaliDateTime.create({ year, month, day: 1 }, timeZone);
    const cells: (CalendarDay | null)[] = Array.from({ length: first.dayOfWeek() }, () => null);
    for (let value = 1; value <= daysInMonth; value++) {
      const date = first.addDays(value - 1);
      cells.push({
        value,
        date,
        weekday: date.dayOfWeek(),
        isToday:
          today === undefined ? false : date.format() === today.toTimeZone(timeZone).format(),
      });
    }
    const weeks: (CalendarDay | null)[][] = [];
    for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
    return { year, month, daysInMonth, weeks };
  }, [year, month, timeZone, today]);
}

export interface JalaliRange {
  readonly start: JalaliDateTime | null;
  readonly end: JalaliDateTime | null;
}

export interface JalaliRangeController extends JalaliRange {
  readonly isValid: boolean;
  readonly setStart: (value: JalaliDateTime | null) => void;
  readonly setEnd: (value: JalaliDateTime | null) => void;
  readonly setRange: (range: JalaliRange) => void;
  readonly contains: (value: JalaliDateTime) => boolean;
  readonly clear: () => void;
}

/** Immutable range state. Incomplete ranges are valid but do not contain dates. */
export function useJalaliRange(
  initial: JalaliRange = { start: null, end: null },
): JalaliRangeController {
  const [range, setCurrentRange] = useState(initial);
  const setStart = useCallback((start: JalaliDateTime | null): void => {
    setCurrentRange((current) => ({ ...current, start }));
  }, []);
  const setEnd = useCallback((end: JalaliDateTime | null): void => {
    setCurrentRange((current) => ({ ...current, end }));
  }, []);
  const setRange = useCallback((next: JalaliRange): void => {
    setCurrentRange(next);
  }, []);
  const clear = useCallback((): void => {
    setCurrentRange({ start: null, end: null });
  }, []);
  const isValid = range.start === null || range.end === null || range.start.compare(range.end) <= 0;
  const contains = useCallback(
    (value: JalaliDateTime): boolean =>
      range.start !== null &&
      range.end !== null &&
      isValid &&
      value.compare(range.start) >= 0 &&
      value.compare(range.end) <= 0,
    [range.start, range.end, isValid],
  );
  return useMemo(
    () => ({ ...range, isValid, setStart, setEnd, setRange, contains, clear }),
    [range, isValid, setStart, setEnd, setRange, contains, clear],
  );
}

export interface JalaliFormatterOptions {
  readonly persianDigits?: boolean;
}

/** Stable formatter callback suitable for child props and memoized components. */
export function useJalaliFormatter(
  format = 'Y/m/d',
  options: JalaliFormatterOptions = {},
): (date: JalaliDateTime | null) => string {
  const { persianDigits = false } = options;
  return useCallback(
    (date): string => date?.format(format, persianDigits) ?? '',
    [format, persianDigits],
  );
}

export interface JalaliCountdownOptions {
  /** Serialized clock snapshot for identical server render and first client render. */
  readonly initialNow?: number;
  /** Explicit clock, useful for deterministic apps and tests. */
  readonly clock?: () => number;
  readonly intervalMs?: number;
}

export interface JalaliCountdown {
  readonly now: number | null;
  readonly remainingNanoseconds: bigint | null;
  readonly remainingMilliseconds: number | null;
  readonly isComplete: boolean;
}

const systemClock = (): number => Date.now();

/** SSR-safe countdown; the timer starts after hydration and is always cleaned up. */
export function useJalaliCountdown(
  target: JalaliDateTime,
  options: JalaliCountdownOptions = {},
): JalaliCountdown {
  const { initialNow, intervalMs = 1_000, clock = systemClock } = options;
  if (!Number.isInteger(intervalMs) || intervalMs < 1)
    throw new RangeError('intervalMs must be a positive integer.');
  const [now, setNow] = useState<number | null>(() => initialNow ?? null);
  useEffect(() => {
    const update = (): void => {
      const next = clock();
      setNow((current) => (current === next ? current : next));
    };
    update();
    const timer = globalThis.setInterval(update, intervalMs);
    return (): void => {
      globalThis.clearInterval(timer);
    };
  }, [clock, intervalMs]);
  return useMemo(() => {
    if (now === null)
      return { now, remainingNanoseconds: null, remainingMilliseconds: null, isComplete: false };
    const remainingNanoseconds = target.epochNanoseconds - BigInt(now) * 1_000_000n;
    return {
      now,
      remainingNanoseconds,
      remainingMilliseconds: Number(remainingNanoseconds) / 1_000_000,
      isComplete: remainingNanoseconds <= 0n,
    };
  }, [now, target]);
}
