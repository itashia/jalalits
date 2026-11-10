# Calendar conversion and DateTime API

## Conversion

`PersianCalendar.toGregorian({year, month, day})` and `fromGregorian({year, month, day})` are pure conversions. Jalali years 1–3177 are supported. The table-based Borkowski model is deterministic and may differ from calendars based on independently observed equinoxes.

## Date-time values

`JalaliDateTime.create(fields, timeZone)` constructs Jalali wall-time fields. Values are immutable and compare by instant. `fromDate` accepts a JavaScript `Date` and therefore has millisecond precision. `fromEpochNanoseconds` and the `epochNanoseconds` getter preserve nanosecond precision.

## Parsing and formatting

`parse` accepts `YYYY/MM/DD`. `parseFormat` supports numeric `Y m d H i s u`, with `u` as six microsecond digits. `format` supports Jalali `Y m n d j F l z t L`, time and timezone tokens, escaped literals, and optional Persian digits. Unsupported alphabetic tokens and dangling escapes throw.

## Arithmetic and comparison

Calendar-day arithmetic preserves local wall time across daylight-saving transitions. Hour/minute/second arithmetic advances elapsed time. Month/year changes clamp to a valid destination day. Comparisons (`compare`, `equals`, `isBefore`, `isAfter`) compare instants. Weekday index 0 is Saturday.

## Timezones and localization

Timezone identifiers are explicit IANA names handled by the runtime `Intl` implementation. Creating a nonexistent local wall time throws; an ambiguous repeated wall time resolves according to the implementation's selected offset. `toTimeZone` preserves the instant. Persian month and weekday names are built in; digit localization is selected per formatting call. There is no global locale or timezone state.

JavaScript `Date` and `toISOString()` are millisecond-precision boundaries. The core keeps nanoseconds internally and exposes them through `epochNanoseconds` for lossless adapters.
