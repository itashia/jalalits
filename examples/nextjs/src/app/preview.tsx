'use client';

import { useJalaliCalendar } from '@jalalits/react';
import type { JSX } from 'react';

export function CalendarPreview(): JSX.Element {
  const calendar = useJalaliCalendar({ year: 1405, month: 8, timeZone: 'Asia/Tehran' });
  return (
    <ol aria-label="آبان ۱۴۰۵">
      {calendar.weeks
        .flat()
        .filter((day) => day !== null)
        .map((day) => (
          <li key={day.date.format()}>{day.value}</li>
        ))}
    </ol>
  );
}
