# @jalalits/zod

Zod 4 schemas for Jalali date strings, date-times, bounded values, and inclusive date ranges. Schemas transform valid inputs into immutable `JalaliDateTime` values.

```ts
import { zJalaliDate } from '@jalalits/zod';

const birthday = zJalaliDate({ min: '1300/01/01', max: '1500/12/29', locale: 'fa' });
const parsed = birthday.parse('۱۴۰۵/۰۸/۱۹'); // JalaliDateTime
```

Bounds are parsed and checked when the schema is created. Invalid bounds or reversed constraints throw immediately. Date-time input is `YYYY/MM/DD HH:mm:ss` with optional six-digit microseconds. Peer requirements: `jalalits` and Zod 4.
