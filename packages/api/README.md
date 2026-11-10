# @jalalits/api

Framework-neutral parsing, normalization, conversion, validation, and serialization helpers for API and form boundaries.

```ts
import { parseRequestDate, serializeResponseDate } from '@jalalits/api';

const value = parseRequestDate(request.body.startDate, { kind: 'date', timeZone: 'Asia/Tehran' });
const response = serializeResponseDate(value, { kind: 'date', calendar: 'jalali' });
```

Date-only Jalali and Gregorian serialization is timezone-neutral. Datetime output defaults to Gregorian ISO-like local fields with an explicit UTC offset. Conversion functions use the public `jalalits` exports and have no framework or runtime dependencies.
