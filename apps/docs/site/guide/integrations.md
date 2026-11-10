# React, Zod, Temporal, and API boundaries

## React integration

`@jalalits/react` provides `useJalaliDate`, `useJalaliCalendar`, `useJalaliRange`, `useJalaliFormatter`, and `useJalaliCountdown`. Calendar year/month inputs are explicit. A countdown accepts an optional serialized `initialNow`; without it the server and first client render both show an empty snapshot, and the clock begins in an effect.

```tsx
'use client';
import { useJalaliCalendar } from '@jalalits/react';

const calendar = useJalaliCalendar({ year: 1405, month: 8, timeZone: 'Asia/Tehran' });
```

The package is headless and requires React 19.

## Zod integration

`@jalalits/zod` supports Zod 4. `zJalaliDate({min, max, locale})` transforms valid strings to `JalaliDateTime`. Invalid bound strings and reversed bounds throw at schema construction. `zJalaliDateTime` accepts strict numeric Jalali date-times. `zJalaliRange` validates inclusive ordered `{start, end}` ranges.

## Temporal integration

`@jalalits/temporal` converts Instant, PlainDate, PlainDateTime, and ZonedDateTime values. Instant conversion preserves nanoseconds. PlainDateTime conversion interprets local fields in an explicit timezone. Supply native `Temporal` or an optional polyfill namespace; no global is installed.

## API serialization

`@jalalits/api` parses request fields, normalizes form input, serializes date-only and datetime responses, validates API boundaries, and explicitly converts Gregorian date fields. Datetime serialization defaults to Gregorian ISO-like fields with an explicit offset; choose `calendar: 'jalali'` when the wire contract requires Jalali text.
