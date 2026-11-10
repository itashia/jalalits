'use client';

import { useJalaliCalendar } from '@jalalits/react';
import type { JSX } from 'react';
import type { JalaliDateTime } from 'jalalits';

export function JalaliDatePicker({
  year,
  month,
  onSelect,
}: {
  readonly year: number;
  readonly month: number;
  readonly onSelect: (date: JalaliDateTime) => void;
}): JSX.Element {
  const calendar = useJalaliCalendar({ year, month });
  return (
    <div role="grid" aria-label={`${String(year)}/${String(month)}`}>
      {calendar.weeks.map((week, weekIndex) => (
        <div role="row" key={weekIndex}>
          {week.map((cell, cellIndex) =>
            cell === null ? (
              <span role="gridcell" aria-hidden="true" key={`empty-${String(cellIndex)}`} />
            ) : (
              <button
                role="gridcell"
                type="button"
                key={`day-${String(cell.value)}`}
                onClick={() => {
                  onSelect(cell.date);
                }}
              >
                {cell.value}
              </button>
            ),
          )}
        </div>
      ))}
    </div>
  );
}
