import { act, cleanup, renderHook } from '@testing-library/react';
import type { JSX } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JalaliDateTime } from 'jalalits';
import {
  useJalaliCalendar,
  useJalaliCountdown,
  useJalaliDate,
  useJalaliFormatter,
  useJalaliRange,
} from '../src/index.js';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Jalali React hooks', () => {
  it('renders the same explicit calendar snapshot on the server', () => {
    const html = renderToString(<Calendar />);
    expect(html).toContain('1405/08/19');
    expect(html).toContain('سه‌شنبه');
  });

  it('hydrates countdown output without recoverable mismatch errors', () => {
    const target = JalaliDateTime.parse('1405/08/20');
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Countdown target={target} />);
    const errors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    act(() => {
      root = hydrateRoot(container, <Countdown target={target} />, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    expect(errors).toEqual([]);
    act(() => {
      root?.unmount();
    });
  });

  it('updates date state immutably and retains stable action references', () => {
    const initialValue = JalaliDateTime.parse('1405/08/19');
    const { result, rerender } = renderHook(() => useJalaliDate({ initialValue }));
    const addDays = result.current.addDays;
    act(() => {
      result.current.addDays(1);
    });
    expect(result.current.date?.format()).toBe('1405/08/20');
    rerender();
    expect(result.current.addDays).toBe(addDays);
  });

  it('returns fixed week rows with Saturday as the first weekday', () => {
    const { result } = renderHook(() => useJalaliCalendar({ year: 1405, month: 8 }));
    const firstDate = result.current.weeks[0]?.find((cell) => cell !== null);
    expect(firstDate?.value).toBe(1);
    expect(firstDate?.weekday).toBe(6);
    expect(result.current.daysInMonth).toBe(30);
  });

  it('validates and queries a date range', () => {
    const start = JalaliDateTime.parse('1405/08/19');
    const end = JalaliDateTime.parse('1405/08/21');
    const { result } = renderHook(() => useJalaliRange({ start, end }));
    expect(result.current.isValid).toBe(true);
    expect(result.current.contains(JalaliDateTime.parse('1405/08/20'))).toBe(true);
    act(() => {
      result.current.setStart(JalaliDateTime.parse('1405/08/22'));
    });
    expect(result.current.isValid).toBe(false);
  });

  it('keeps formatter references stable until formatting options change', () => {
    const { result, rerender } = renderHook(({ format }) => useJalaliFormatter(format), {
      initialProps: { format: 'Y/m/d' },
    });
    const formatter = result.current;
    rerender({ format: 'Y/m/d' });
    expect(result.current).toBe(formatter);
    expect(formatter(JalaliDateTime.parse('1405/08/19'))).toBe('1405/08/19');
  });

  it('does not start a timer during SSR and clears its timer on unmount', () => {
    vi.useFakeTimers();
    const target = JalaliDateTime.parse('1405/08/20');
    expect(renderToString(<Countdown target={target} />)).toContain('1000');
    const { unmount } = renderHook(() =>
      useJalaliCountdown(target, { initialNow: target.epochMilliseconds - 1_000 }),
    );
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

function Calendar(): JSX.Element {
  const calendar = useJalaliCalendar({ year: 1405, month: 8 });
  const date = calendar.weeks.flat().find((cell) => cell?.value === 19)?.date;
  return <div>{date?.format('l Y/m/d')}</div>;
}

function Countdown({ target }: { target: JalaliDateTime }): JSX.Element {
  const countdown = useJalaliCountdown(target, { initialNow: target.epochMilliseconds - 1_000 });
  return <span>{countdown.remainingMilliseconds}</span>;
}
