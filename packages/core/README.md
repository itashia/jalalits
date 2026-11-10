# jalalits

JalaliTS is a modern, powerful, zero-dependency Persian (Jalali) date and time library built with TypeScript. The core provides immutable calendar and date-time primitives.

```sh
npm install jalalits
```

```ts
import { jalali, JalaliDateTime } from 'jalalits';

const date = jalali('۱۴۰۵/۰۸/۱۹', 'Asia/Tehran');
date.format('l j F Y'); // سه‌شنبه 19 آبان 1405
date.addMonths(1).format('Y/m/d'); // 1405/09/19
const explicit = JalaliDateTime.parse('۱۴۰۵/۰۸/۱۹', 'Asia/Tehran');
```

The calendar engine follows the Borkowski break-year model and supports Jalali years 1–3177. See the repository [API documentation](../../docs/en/api.md) for parsing, tokens, arithmetic, timezones, and error behavior.
