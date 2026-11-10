import { InvalidDateError } from '../errors/invalid-date.js';
import { toLatinDigits } from '../localization/digits.js';
import type { DateTimeFields } from '../types/calendar.js';

export function parseJalaliDate(input: string): DateTimeFields {
  const match = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(toLatinDigits(input));
  if (!match)
    throw new InvalidDateError('Expected YYYY/MM/DD with Latin, Persian or Arabic-Indic digits.');
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

export function parseJalaliFormat(format: string, input: string): DateTimeFields {
  const patterns: Record<string, string> = {
    Y: '\\d{4}',
    m: '\\d{2}',
    d: '\\d{2}',
    H: '\\d{2}',
    i: '\\d{2}',
    s: '\\d{2}',
    u: '\\d{6}',
  };
  const captures: string[] = [];
  let expression = '';
  let escaped = false;
  for (const token of format) {
    if (escaped) {
      expression += token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      escaped = false;
    } else if (token === '\\') escaped = true;
    else if (patterns[token]) {
      if (captures.includes(token)) throw new InvalidDateError('Repeated parser token.');
      captures.push(token);
      expression += `(${patterns[token]})`;
    } else if (/[A-Za-z]/.test(token))
      throw new InvalidDateError(`Unsupported parser token: ${token}`);
    else expression += token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  if (escaped || !['Y', 'm', 'd'].every((token) => captures.includes(token)))
    throw new InvalidDateError('A parser format requires Y, m and d and no dangling escape.');
  const match = new RegExp(`^${expression}$`).exec(toLatinDigits(input));
  if (!match) throw new InvalidDateError('Input does not match the requested format.');
  const values: Record<string, number> = {};
  captures.forEach((token, index) => {
    const captured = match[index + 1];
    if (captured !== undefined) values[token] = Number(captured);
  });
  const required = (token: string): number => {
    const value = values[token];
    if (value === undefined) throw new InvalidDateError(`Missing parser token: ${token}`);
    return value;
  };
  return {
    year: required('Y'),
    month: required('m'),
    day: required('d'),
    ...(values.H === undefined ? {} : { hour: values.H }),
    ...(values.i === undefined ? {} : { minute: values.i }),
    ...(values.s === undefined ? {} : { second: values.s }),
    ...(values.u === undefined ? {} : { microsecond: values.u }),
  };
}
