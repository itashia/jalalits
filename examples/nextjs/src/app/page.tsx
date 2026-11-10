import { JalaliDateTime } from 'jalalits';
import type { JSX } from 'react';
import { CalendarPreview } from './preview';

export default function Home(): JSX.Element {
  const date = JalaliDateTime.parse('1405/08/19', 'Asia/Tehran');
  return (
    <main>
      <h1>JalaliTS Next.js SSR example</h1>
      <p id="initial-date">{date.format('l j F Y')}</p>
      <CalendarPreview />
    </main>
  );
}
